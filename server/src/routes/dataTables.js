const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/datatables'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/datatables', req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:name', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/datatables/${req.params.name}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:name', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/datatables/${req.params.name}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:name', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/datatables/${req.params.name}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
