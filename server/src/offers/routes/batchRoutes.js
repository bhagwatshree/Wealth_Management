const router = require('express').Router();
const navService = require('../services/navService');
const batchScheduler = require('../services/batchScheduler');

// GET /api/offers/batch/status — all batch jobs
router.get('/status', async (req, res, next) => {
  try {
    res.json({
      completedBatches: navService.getAllBatches(),
      scheduledJobs: batchScheduler.getScheduledJobs(),
    });
  } catch (e) { next(e); }
});

// GET /api/offers/batch/:id — specific batch status
router.get('/:id', async (req, res, next) => {
  try {
    const batch = navService.getBatchStatus(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (e) { next(e); }
});

// POST /api/offers/batch/schedule — schedule a NAV update job
router.post('/schedule', async (req, res, next) => {
  try {
    const { jobId, cronExpression, sftpConfig } = req.body;
    if (!jobId || !cronExpression) {
      return res.status(400).json({ error: 'jobId and cronExpression are required' });
    }
    const result = batchScheduler.scheduleNavUpdate(jobId, cronExpression, sftpConfig);
    if (!result) return res.status(503).json({ error: 'Scheduler not available — install node-cron' });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// DELETE /api/offers/batch/schedule/:jobId — cancel a scheduled job
router.delete('/schedule/:jobId', async (req, res, next) => {
  try {
    const cancelled = batchScheduler.cancelJob(req.params.jobId);
    if (!cancelled) return res.status(404).json({ error: 'Job not found' });
    res.json({ cancelled: true, jobId: req.params.jobId });
  } catch (e) { next(e); }
});

module.exports = router;
