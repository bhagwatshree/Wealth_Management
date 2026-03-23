const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

// List savings accounts
router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/savingsaccounts', { params: req.query }); res.json(data); } catch (e) { next(e); }
});

// Get single savings account
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/savingsaccounts/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

// Create savings account
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/savingsaccounts', req.body); res.json(data); } catch (e) { next(e); }
});

// Approve savings account
router.post('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/savingsaccounts/${req.params.id}`, req.body, { params: req.query }); res.json(data); } catch (e) { next(e); }
});

// Update savings account
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/savingsaccounts/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});

// Delete savings account
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/savingsaccounts/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
