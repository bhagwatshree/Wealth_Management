const router = require('express').Router();
const navService = require('../services/navService');

// POST /api/offers/nav/trigger — manual NAV batch trigger with CSV body
router.post('/trigger', async (req, res, next) => {
  try {
    const { csvData, format } = req.body;
    if (!csvData) return res.status(400).json({ error: 'csvData is required (CSV string)' });
    const buffer = Buffer.from(csvData, 'utf8');
    const batch = await navService.processNavFile(buffer, format || 'csv');
    res.status(201).json(batch);
  } catch (e) { next(e); }
});

// GET /api/offers/nav — list all latest NAV values
router.get('/', async (req, res, next) => {
  try {
    res.json(navService.getAllNav());
  } catch (e) { next(e); }
});

// GET /api/offers/nav/:fundCode — latest NAV for a fund
router.get('/:fundCode', async (req, res, next) => {
  try {
    const nav = navService.getLatestNav(req.params.fundCode);
    if (!nav) return res.status(404).json({ error: 'NAV not found for this fund code' });
    res.json(nav);
  } catch (e) { next(e); }
});

// GET /api/offers/nav/:fundCode/history — NAV history
router.get('/:fundCode/history', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const history = navService.getNavHistory(req.params.fundCode, limit);
    if (!history) return res.status(404).json({ error: 'NAV not found for this fund code' });
    res.json(history);
  } catch (e) { next(e); }
});

module.exports = router;
