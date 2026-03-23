const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try { const { data } = await fineractApi.get('/roles'); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/roles', req.body); res.json(data); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/roles/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/roles/${req.params.id}`, req.body); res.json(data); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.delete(`/roles/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.get('/:id/permissions', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/roles/${req.params.id}/permissions`); res.json(data); } catch (e) { next(e); }
});
router.put('/:id/permissions', async (req, res, next) => {
  try { const { data } = await fineractApi.put(`/roles/${req.params.id}/permissions`, req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
