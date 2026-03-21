const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/paymenttypes'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/paymenttypes', req.body); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/paymenttypes/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/paymenttypes/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
