const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/delinquency/ranges'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/delinquency/ranges', req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/delinquency/ranges/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/delinquency/ranges/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/delinquency/ranges/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
