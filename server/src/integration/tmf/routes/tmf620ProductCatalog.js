/**
 * TMF620 — Product Catalog Management
 *
 * Standardized API for managing product offerings in the wealth management catalog.
 * Maps to: offers/services/productCatalogService
 *
 * Resources:
 *   ProductOffering    — a product available for sale (MMF, Bonds, FD, etc.)
 *   ProductCategory    — grouping of product offerings (Equities, Fixed Income, etc.)
 *
 * Endpoints:
 *   GET    /productOffering          — list product offerings
 *   POST   /productOffering          — create a product offering
 *   GET    /productOffering/:id      — retrieve a product offering
 *   PATCH  /productOffering/:id      — partial update
 *   GET    /productCategory          — list product categories
 */

const router = require('express').Router();
const { toTmfResource, toTmfCollection, sendTmfCollection } = require('../common/tmfEnvelope');
const { tmfErrors } = require('../common/tmfError');
const { requireFields, validateEnum } = require('../common/tmfValidator');
const catalog = require('../../../offers/services/productCatalogService');
const navService = require('../../../offers/services/navService');

const TMF_TYPE = 'ProductOffering';
const BASE = '/tmf620/productOffering';
const CATEGORY_BASE = '/tmf620/productCategory';

// -- Mappers: internal model <-> TMF620 --

function toTmfProduct(product) {
  const tmf = {
    id: product.productId,
    name: product.name,
    description: product.description,
    lifecycleStatus: product.status === 'ACTIVE' ? 'Active' : product.status === 'RETIRED' ? 'Retired' : 'In design',
    validFor: {
      startDateTime: product.createdAt,
      endDateTime: null,
    },
    version: '1.0',
    lastUpdate: product.updatedAt || product.createdAt,
    isBundle: false,
    isSellable: product.status === 'ACTIVE',
    productOfferingPrice: [
      {
        priceType: 'oneTimeCharge',
        price: {
          unit: product.currency || 'KES',
          value: product.minInvestment || 0,
        },
        name: 'Minimum Investment',
      },
    ],
    category: [
      {
        id: product.category,
        name: product.category,
        '@type': 'CategoryRef',
      },
    ],
    productSpecification: {
      id: product.type,
      name: product.type,
      '@type': 'ProductSpecificationRef',
    },
    channel: [
      { id: 'WEB', name: 'Web Portal' },
      { id: 'APP', name: 'Mobile App' },
      { id: 'USSD', name: 'USSD' },
    ],
    place: [],
    productOfferingTerm: product.tenor
      ? [{ name: 'Investment Tenor', duration: { amount: product.tenor, units: 'days' } }]
      : [],
    // Wealth-specific extensions
    'x-wealthMgmt': {
      riskLevel: product.riskLevel,
      expectedReturn: product.expectedReturn,
      maxInvestment: product.maxInvestment,
      navEnabled: product.navEnabled,
      fundManagerId: product.fundManagerId,
      fundManagerName: product.fundManagerName,
      fineractProductId: product.fineractProductId,
      fineractProductType: product.fineractProductType,
    },
  };

  // Enrich with NAV if applicable
  if (product.navEnabled && product.metadata?.fundCode) {
    const nav = navService.getLatestNav(product.metadata.fundCode);
    if (nav) {
      tmf['x-wealthMgmt'].latestNav = nav.navValue;
      tmf['x-wealthMgmt'].navDate = nav.navDate;
    }
  }

  return tmf;
}

function fromTmfProduct(body) {
  return {
    name: body.name,
    shortName: body.shortName || '',
    description: body.description || '',
    category: body.category?.[0]?.id || body.category || 'SAVINGS',
    type: body.productSpecification?.id || body.type || 'FIXED_DEPOSIT',
    currency: body.productOfferingPrice?.[0]?.price?.unit || body.currency || 'KES',
    minInvestment: body.productOfferingPrice?.[0]?.price?.value || body.minInvestment || 0,
    maxInvestment: body['x-wealthMgmt']?.maxInvestment || body.maxInvestment || null,
    expectedReturn: body['x-wealthMgmt']?.expectedReturn || body.expectedReturn || null,
    riskLevel: body['x-wealthMgmt']?.riskLevel || body.riskLevel || 'MEDIUM',
    tenor: body.productOfferingTerm?.[0]?.duration?.amount || body.tenor || null,
    navEnabled: body['x-wealthMgmt']?.navEnabled || body.navEnabled || false,
    fundManagerId: body['x-wealthMgmt']?.fundManagerId || body.fundManagerId || null,
    fundManagerName: body['x-wealthMgmt']?.fundManagerName || body.fundManagerName || '',
    status: body.lifecycleStatus === 'Active' ? 'ACTIVE' : body.lifecycleStatus === 'Retired' ? 'RETIRED' : 'DRAFT',
    metadata: body.metadata || {},
  };
}

// -- Routes --

// GET /productOffering
router.get('/productOffering', (req, res, next) => {
  try {
    const { category, type, status, search, fundManagerId } = req.query;
    const products = catalog.getAllProducts({ category, type, status, search, fundManagerId });
    const tmfProducts = products.map(toTmfProduct);
    const collection = toTmfCollection(tmfProducts, {
      type: TMF_TYPE,
      basePath: BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

// POST /productOffering
router.post('/productOffering', (req, res, next) => {
  try {
    requireFields(req.body, ['name']);
    const internal = fromTmfProduct(req.body);
    const product = catalog.createProduct(internal);
    const tmf = toTmfResource(toTmfProduct(product), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.status(201).json(tmf);
  } catch (e) { next(e); }
});

// GET /productOffering/:id
router.get('/productOffering/:id', (req, res, next) => {
  try {
    const product = catalog.getProduct(req.params.id);
    if (!product) throw tmfErrors.notFound('ProductOffering', req.params.id);
    const tmf = toTmfResource(toTmfProduct(product), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.json(tmf);
  } catch (e) { next(e); }
});

// PATCH /productOffering/:id
router.patch('/productOffering/:id', (req, res, next) => {
  try {
    const updates = fromTmfProduct(req.body);
    // Remove undefined fields so we only patch what's provided
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);
    const product = catalog.updateProduct(req.params.id, updates);
    const tmf = toTmfResource(toTmfProduct(product), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.json(tmf);
  } catch (e) { next(e); }
});

// GET /productCategory
router.get('/productCategory', (req, res, next) => {
  try {
    const categories = catalog.CATEGORIES.map((cat, idx) => ({
      id: cat,
      name: cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `${cat} product category`,
      lifecycleStatus: 'Active',
      isRoot: true,
      '@type': 'ProductCategory',
      version: '1.0',
    }));
    const collection = toTmfCollection(categories, {
      type: 'ProductCategory',
      basePath: CATEGORY_BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

module.exports = router;
