const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const productStore = require('../store/productStore');

const CATEGORIES = [
  'EQUITIES',
  'FIXED_INCOME',
  'SAVINGS',
  'DIGITAL_ASSETS',
  'ALTERNATIVE_INVESTMENTS',
  'INVESTMENT_FUNDS',
  'TAX_EFFICIENT',
  'FOREX',
  'STRUCTURED_EMBEDDED',
];

const PRODUCT_TYPES = [
  'MONEY_MARKET_FUND',
  'TREASURY_BONDS',
  'TREASURY_BILLS',
  'STOCK_TRADING',
  'FIXED_DEPOSIT',
  'PENSION',
  'GROUP_SAVINGS',
  'CROWD_FUNDING',
  'DIGITAL_GOLD',
  'OFFSHORE_INVESTMENT',
];

function createProduct(productData) {
  const productId = uuidv4();
  const product = {
    productId,
    name: productData.name,
    shortName: productData.shortName || '',
    category: productData.category || 'SAVINGS',
    type: productData.type || 'FIXED_DEPOSIT',
    description: productData.description || '',
    currency: productData.currency || 'KES',
    minInvestment: productData.minInvestment || 0,
    maxInvestment: productData.maxInvestment || null,
    expectedReturn: productData.expectedReturn || null,
    riskLevel: productData.riskLevel || 'MEDIUM',
    tenor: productData.tenor || null,
    navEnabled: productData.navEnabled || false,
    fundManagerId: productData.fundManagerId || null,
    fundManagerName: productData.fundManagerName || '',
    fineractProductId: productData.fineractProductId || null,
    fineractProductType: productData.fineractProductType || null,
    status: productData.status || 'ACTIVE',
    metadata: productData.metadata || {},
    createdAt: new Date().toISOString(),
  };

  productStore.set(productId, product);
  return product;
}

function getProduct(productId) {
  return productStore.get(productId);
}

function getAllProducts(filters = {}) {
  return productStore.find((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.navEnabled !== undefined && p.navEnabled !== filters.navEnabled) return false;
    if (filters.fundManagerId && p.fundManagerId !== filters.fundManagerId) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(term) && !p.shortName.toLowerCase().includes(term)) return false;
    }
    return true;
  });
}

function updateProduct(productId, updates) {
  const product = productStore.get(productId);
  if (!product) throw new Error(`Product ${productId} not found`);

  const updated = { ...product, ...updates, productId, createdAt: product.createdAt };
  productStore.set(productId, updated);
  eventBus.publish(events.PRODUCT_UPDATED, { productId });
  return updated;
}

function linkToFineract(productId, fineractProductId, fineractProductType) {
  return updateProduct(productId, { fineractProductId, fineractProductType });
}

module.exports = { createProduct, getProduct, getAllProducts, updateProduct, linkToFineract, CATEGORIES, PRODUCT_TYPES };
