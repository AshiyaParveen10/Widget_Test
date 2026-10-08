const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function normalizeReaderGroups(value) {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPayload(req) {
  const clientId = process.env.DOCUMENT360_CLIENT_ID;
  const widgetId = process.env.DOCUMENT360_WIDGET_ID;
  const rawReaderGroupIds = req.query.securityGroupIds || req.body.securityGroupIds || process.env.DOCUMENT360_READER_GROUP_IDS || '';
  const tokenValidity = Number(req.query.tokenValidity || req.body.tokenValidity || process.env.DOCUMENT360_TOKEN_VALIDITY || 900);

  const firstName = req.query.firstName || req.body.firstName || 'Demo';
  const lastName = req.query.lastName || req.body.lastName || 'User';
  const emailId = req.query.emailId || req.body.emailId || 'demo.user@example.com';
  const username = req.query.username || req.body.username || `demo.user.${Date.now()}`;

  return {
    username,
    firstName,
    lastName,
    emailId,
    readerGroupIds: normalizeReaderGroups(rawReaderGroupIds),
    tokenValidity,
    widgetId,
    projectId: clientId,
  };
}

async function exchangeTokenForWidget(payload, id) {
  const tokenEndpoint = process.env.DOCUMENT360_TOKEN_ENDPOINT;
  const clientId = process.env.DOCUMENT360_CLIENT_ID;
  const clientSecret = process.env.DOCUMENT360_CLIENT_SECRET;

  if (!tokenEndpoint || !clientId || !clientSecret) {
    throw new Error('Document360 configuration is missing. Please set the required environment variables.');
  }

  const body = new URLSearchParams({
    grant_type: 'Widget',
    client_id: clientId,
    client_secret: clientSecret,
    payload: JSON.stringify(payload),
    id,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error_description || data?.error || 'Unknown error';
    throw new Error(message);
  }

  return {
    accessToken: data.access_token || data.accessToken,
    expiresIn: data.expires_in || data.expiresIn || 900,
  };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'document360-widget-auth' });
});

app.get('/authenticate', async (req, res) => {
  try {
    const id = req.query.id || process.env.DOCUMENT360_CLIENT_ID;
    const payload = createPayload(req);
    const token = await exchangeTokenForWidget(payload, id);
    res.json(token);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      message: 'Failed to generate token.',
      details: error.message,
    });
  }
});

app.post('/authenticate', async (req, res) => {
  try {
    const id = req.body.id || req.query.id || process.env.DOCUMENT360_CLIENT_ID;
    const payload = createPayload(req);
    const token = await exchangeTokenForWidget(payload, id);
    res.json(token);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      message: 'Failed to generate token.',
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Document360 widget auth server is running on http://localhost:${port}`);
});
