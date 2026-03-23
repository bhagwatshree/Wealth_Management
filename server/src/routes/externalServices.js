const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/externalservice'); res.json(data); } catch (e) { next(e); }
});
router.get('/:name', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/externalservice/${req.params.name}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:name', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/externalservice/${req.params.name}`, req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
