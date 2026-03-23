const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/codes'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/codes', req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/codes/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/codes/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/codes/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.get('/:id/codevalues', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/codes/${req.params.id}/codevalues`); res.json(data); } catch (e) { next(e); }
});
router.post('/:id/codevalues', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/codes/${req.params.id}/codevalues`, req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
