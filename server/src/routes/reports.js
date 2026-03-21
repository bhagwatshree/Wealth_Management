const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/reports'); res.json(data); } catch (e) { next(e); }
});
router.get('/run/:name', async (req, res, next) => {
  try {
    const { data } = await fineractApi.get(`/runreports/${req.params.name}`, { params: req.query });
    res.json(data);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/reports/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/reports', req.body); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/reports/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/reports/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
