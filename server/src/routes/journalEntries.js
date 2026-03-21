const router = require('express').Router();
const { fineractApi } = require('../services/fineractClient');

router.get('/', async (req, res, next) => {
  try {
    const params = {};
    if (req.query.officeId) params.officeId = req.query.officeId;
    if (req.query.fromDate) params.fromDate = req.query.fromDate;
    if (req.query.toDate) params.toDate = req.query.toDate;
    if (req.query.limit) params.limit = req.query.limit;
    if (req.query.offset) params.offset = req.query.offset;
    const { data } = await fineractApi.get('/journalentries', { params });
    res.json(data);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const { data } = await fineractApi.get(`/journalentries/${req.params.id}`); res.json(data); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { const { data } = await fineractApi.post('/journalentries', req.body); res.json(data); } catch (e) { next(e); }
});

module.exports = router;
