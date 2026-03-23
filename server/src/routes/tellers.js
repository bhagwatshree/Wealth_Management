const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/tellers'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/tellers', req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/tellers/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/tellers/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:id/cashiers', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/tellers/${req.params.id}/cashiers`); res.json(data); } catch (e) { next(e); }
});
router.post('/:id/cashiers', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/tellers/${req.params.id}/cashiers`, req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
