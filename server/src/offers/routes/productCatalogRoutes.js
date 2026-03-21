const router = require('express').Router();
const catalog = require('../services/productCatalogService');

// GET /api/offers/products
router.get('/', async (req, res, next) => {
  try {
    const { category, type, status, search, fundManagerId } = req.query;
    const navEnabled = req.query.navEnabled === 'true' ? true : req.query.navEnabled === 'false' ? false : undefined;
    res.json(catalog.getAllProducts({ category, type, status, navEnabled, fundManagerId, search }));
  } catch (e) { next(e); }
});

// POST /api/offers/products
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'name is required' });
    const product = catalog.createProduct(req.body);
    res.status(201).json(product);
  } catch (e) { next(e); }
});

// GET /api/offers/products/categories
router.get('/categories', (req, res) => {
  res.json({ categories: catalog.CATEGORIES, productTypes: catalog.PRODUCT_TYPES });
});

// GET /api/offers/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = catalog.getProduct(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) { next(e); }
});

// PUT /api/offers/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const product = catalog.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (e) { next(e); }
});

// POST /api/offers/products/:id/link-fineract
router.post('/:id/link-fineract', async (req, res, next) => {
  try {
    const { fineractProductId, fineractProductType } = req.body;
    if (!fineractProductId) return res.status(400).json({ error: 'fineractProductId is required' });
    const product = catalog.linkToFineract(req.params.id, fineractProductId, fineractProductType || 'SAVINGS');
    res.json(product);
  } catch (e) { next(e); }
});

module.exports = router;
