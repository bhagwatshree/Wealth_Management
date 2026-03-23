const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

// List loans
router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/loans', { params: req.query }); res.json(data); } catch (e) { next(e); }
});

// Get single loan
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/loans/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

// Create loan application
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/loans', req.body); res.json(data); } catch (e) { next(e); }
});

// Loan commands (approve, disburse, etc.)
router.post('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/loans/${req.params.id}`, req.body, { params: req.query }); res.json(data); } catch (e) { next(e); }
});

// Update loan
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/loans/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});

// Delete loan
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/loans/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
