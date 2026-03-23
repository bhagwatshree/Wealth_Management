const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/jobs'); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/jobs/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/jobs/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.post('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/jobs/${req.params.id}`, req.body, { params: req.query }); res.json(data); } catch (e) { next(e); }
});
router.get('/:id/runhistory', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/jobs/${req.params.id}/runhistory`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
