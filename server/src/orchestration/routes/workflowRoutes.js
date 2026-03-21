const router = require('express').Router();
const { getWorkflowStatus, getAllWorkflows } = require('../workflows/onboardingWorkflow');

// GET /api/dxl/workflows
router.get('/', async (req, res, next) => {
  try {
    res.json(getAllWorkflows());
  } catch (e) { next(e); }
});

// GET /api/dxl/workflows/:id
router.get('/:id', async (req, res, next) => {
  try {
    const workflow = getWorkflowStatus(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (e) { next(e); }
});

module.exports = router;
