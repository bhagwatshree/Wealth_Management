const router = require('express').Router();
const multer = require('multer');
const FormData = require('form-data');
const { fineractApi } = require('../services/fineractClient');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/client-documents/:clientId — list documents for a client
router.get('/:clientId', async (req, res, next) => {
  try {
    const { data } = await fineractApi.get(`/clients/${req.params.clientId}/documents`);
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/client-documents/:clientId — upload a document to Fineract client
router.post('/:clientId', upload.single('file'), async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('name', name || req.file.originalname);
    form.append('description', description || '');

    const { data } = await fineractApi.post(
      `/clients/${clientId}/documents`,
      form,
      { headers: { ...form.getHeaders() } }
    );

    res.status(201).json(data);
  } catch (e) { next(e); }
});

// GET /api/client-documents/:clientId/:docId/attachment — download document
router.get('/:clientId/:docId/attachment', async (req, res, next) => {
  try {
    const { clientId, docId } = req.params;
    const response = await fineractApi.get(
      `/clients/${clientId}/documents/${docId}/attachment`,
      { responseType: 'arraybuffer' }
    );
    res.set('Content-Type', response.headers['content-type']);
    res.set('Content-Disposition', response.headers['content-disposition'] || 'inline');
    res.send(response.data);
  } catch (e) { next(e); }
});

// DELETE /api/client-documents/:clientId/:docId — delete a document
router.delete('/:clientId/:docId', async (req, res, next) => {
  try {
    const { clientId, docId } = req.params;
    const { data } = await fineractApi.delete(`/clients/${clientId}/documents/${docId}`);
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/client-documents/:clientId/image — upload client image (selfie)
router.post('/:clientId/image', upload.single('file'), async (req, res, next) => {
  try {
    const { clientId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await fineractApi.post(
      `/clients/${clientId}/images`,
      form,
      { headers: { ...form.getHeaders() } }
    );

    res.status(201).json(data);
  } catch (e) { next(e); }
});

// GET /api/client-documents/:clientId/image — get client image
router.get('/:clientId/image', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const response = await fineractApi.get(
      `/clients/${clientId}/images`,
      { responseType: 'arraybuffer' }
    );
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.send(response.data);
  } catch (e) { next(e); }
});

module.exports = router;
