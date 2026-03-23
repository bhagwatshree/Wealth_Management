const router = require('express').Router();
const { fineractApi } = require('../../services/fineractClient');

function formatFineractDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Register a customer in Fineract (called at signup/login)
router.post('/register', async (req, res) => {
  const { email, name, phone } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }

  const parts = name.trim().split(/\s+/);
  const firstname = parts[0] || 'Unknown';
  const lastname = parts.slice(1).join(' ') || firstname;

  // Check if client already exists by externalId (email) — skip closed clients
  try {
    const { data } = await fineractApi.get('/clients', {
      params: { externalId: email, limit: 5 },
    });
    const clients = data.pageItems || data;
    if (Array.isArray(clients)) {
      const existing = clients.find(c => c.status?.value !== 'Closed' && c.status?.id !== 600);
      if (existing) {
        return res.json({
          fineractClientId: existing.id,
          accountNo: existing.accountNo,
          displayName: existing.displayName,
          status: existing.status?.value || 'Active',
          alreadyExists: true,
        });
      }
    }
  } catch (err) {
    console.log('[CustomerRegister] Client search by externalId failed:', err.message);
  }

  // Also search by displayName as fallback — skip closed clients
  try {
    const { data } = await fineractApi.get('/clients', {
      params: { displayName: `${firstname} ${lastname}`, limit: 5 },
    });
    const clients = data.pageItems || data;
    if (Array.isArray(clients)) {
      const match = clients.find(c => c.externalId === email && c.status?.value !== 'Closed' && c.status?.id !== 600);
      if (match) {
        return res.json({
          fineractClientId: match.id,
          accountNo: match.accountNo,
          displayName: match.displayName,
          status: match.status?.value || 'Active',
          alreadyExists: true,
        });
      }
    }
  } catch (err) {
    // continue to create
  }

  // Create new client in Fineract
  try {
    const clientPayload = {
      officeId: 1,
      legalFormId: 1,
      firstname,
      lastname,
      externalId: email,
      mobileNo: phone || '',
      active: true,
      activationDate: formatFineractDate(new Date()),
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
    };

    const { data } = await fineractApi.post('/clients', clientPayload);
    const clientId = data.clientId || data.resourceId;

    // Fetch the created client to get full details
    let accountNo = '';
    try {
      const { data: client } = await fineractApi.get(`/clients/${clientId}`);
      accountNo = client.accountNo || '';
    } catch (_) {}

    res.status(201).json({
      fineractClientId: clientId,
      accountNo,
      displayName: `${firstname} ${lastname}`,
      status: 'Active',
      alreadyExists: false,
    });
  } catch (err) {
    console.error('[CustomerRegister] Fineract client creation failed:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to register in core banking',
      details: err.response?.data?.errors?.[0]?.defaultUserMessage || err.message,
    });
  }
});

// Get customer's Fineract profile by email
router.get('/profile/:email', async (req, res) => {
  try {
    const { data } = await fineractApi.get('/clients', {
      params: { externalId: req.params.email, limit: 1 },
    });
    const clients = data.pageItems || data;
    if (Array.isArray(clients) && clients.length > 0) {
      const c = clients[0];
      return res.json({
        fineractClientId: c.id,
        accountNo: c.accountNo,
        displayName: c.displayName,
        status: c.status?.value,
        activationDate: c.activationDate,
        officeId: c.officeId,
        officeName: c.officeName,
      });
    }
    res.status(404).json({ error: 'Customer not found in Fineract' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
