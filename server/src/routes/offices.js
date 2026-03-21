const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/offices'); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/offices/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/offices', req.body); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/offices/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
