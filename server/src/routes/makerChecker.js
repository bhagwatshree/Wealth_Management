const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/makercheckers', { params: req.query }); res.json(data); } catch (e) { next(e); }
});
router.post('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.post(`/makercheckers/${req.params.id}`, req.body, { params: req.query }); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
