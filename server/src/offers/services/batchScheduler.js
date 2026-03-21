const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const navService = require('./navService');
const sftpService = require('./sftpService');
const navFileParser = require('../parsers/navFileParser');

let cron;
try {
  cron = require('node-cron');
} catch {
  cron = null;
}

const scheduledJobs = new Map();

function init() {
  if (!cron) {
    console.warn('[BatchScheduler] node-cron not installed — scheduling disabled. Install with: npm install node-cron');
    return;
  }
  console.log('[BatchScheduler] Initialized — ready to accept job schedules');
}

function scheduleNavUpdate(jobId, cronExpression, sftpConfig) {
  if (!cron) {
    console.warn('[BatchScheduler] Cannot schedule — node-cron not installed');
    return null;
  }

  if (!cron.validate(cronExpression)) {
    throw new Error(`Invalid cron expression: ${cronExpression}`);
  }

  // Cancel existing job with same ID
  if (scheduledJobs.has(jobId)) {
    scheduledJobs.get(jobId).task.stop();
  }

  const task = cron.schedule(cronExpression, async () => {
    console.log(`[BatchScheduler] Running NAV update job: ${jobId}`);
    try {
      if (sftpConfig) {
        // SFTP-based NAV update
        await sftpService.connect(jobId, sftpConfig);
        const files = await sftpService.listFiles(jobId, sftpConfig.remotePath || '/', sftpConfig.filePattern || '\\.csv$');

        for (const file of files) {
          const buffer = await sftpService.downloadFile(jobId, `${sftpConfig.remotePath || '/'}${file.name}`);
          await navService.processNavFile(buffer, 'csv');
        }

        await sftpService.disconnect(jobId);
      }
    } catch (err) {
      console.error(`[BatchScheduler] Job ${jobId} failed:`, err.message);
    }
  });

  const job = {
    jobId,
    cronExpression,
    sftpHost: sftpConfig?.host || null,
    status: 'SCHEDULED',
    task,
    createdAt: new Date().toISOString(),
  };

  scheduledJobs.set(jobId, job);
  console.log(`[BatchScheduler] Scheduled job ${jobId}: ${cronExpression}`);
  return { jobId, cronExpression, status: 'SCHEDULED' };
}

function cancelJob(jobId) {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.task.stop();
    scheduledJobs.delete(jobId);
    return true;
  }
  return false;
}

function getScheduledJobs() {
  return [...scheduledJobs.entries()].map(([id, job]) => ({
    jobId: id,
    cronExpression: job.cronExpression,
    sftpHost: job.sftpHost,
    status: job.status,
    createdAt: job.createdAt,
  }));
}

module.exports = { init, scheduleNavUpdate, cancelJob, getScheduledJobs };
