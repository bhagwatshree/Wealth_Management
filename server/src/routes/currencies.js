const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/currencies'); res.json(data); } catch (e) { next(e); }
});
router.put('/', async (req, res, next) => {
  try { const { data } = await fineractApi.put('/currencies', req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
