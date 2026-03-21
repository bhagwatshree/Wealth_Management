const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try {
    const { data } = await fineractApi.get('/audits', { params: req.query });
    res.json(data);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/audits/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
