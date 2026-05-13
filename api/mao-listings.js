/* ============================================================
   Vercel Serverless Function — MAO Private Exchange Click Wall
   GET /api/mao-listings
   ============================================================ */

const MAO_API_URL = 'https://api.myadoptimizer.com/api/MAOListingsServerAPI';
const LANDING_PAGE_TOKEN = process.env.MAO_LANDING_PAGE_TOKEN || 'ea9e547a-dd3c-f111-8ef3-0022484aea22';
const SOURCE_ID = process.env.MAO_SOURCE_ID || '196';

/* ── Field Mapping Tables ────────────────────────── */

const CREDIT_MAP = {
  'excellent': 'Excellent',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
};

const PROPERTY_TYPE_MAP = {
  'single-family': 'Single Family',
  'condo': 'Condo/Townhome',
  'multi-family': 'Multi-Unit',
  'manufactured': 'Mobile',
};

const PROPERTY_USE_MAP = {
  'primary': 'Primary Home',
  'secondary': 'Second Home',
  'rental': 'Rental Property',
};

const GOAL_TO_CASHOUT = {
  'cash-out': 'Yes',
  'lower-payment': 'No',
  'shorten-term': 'No',
  'consolidate': 'No',
};

const EMPLOYMENT_MAP = {
  'employed': 'Employed',
  'self-employed': 'Self-Employed',
  'retired': 'Retired',
  'not-employed': 'Not Employed',
};

/* ── Helpers ────────────────────────────────────── */

function parseCurrency(val) {
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}

function extractState(address) {
  // Try to extract 2-letter state code from address like "123 Main St, City, CA"
  const match = String(address || '').match(/,\s*([A-Z]{2})\s*$/);
  return match ? match[1] : '';
}

export default async function handler(req, res) {
  // Allow GET and POST (POST for convenience from frontend)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.method === 'POST' ? req.body : req.query;

  try {
    // Build MAO query string parameters
    const params = new URLSearchParams();
    params.set('LandingPageToken', LANDING_PAGE_TOKEN);
    params.set('SourceID', SOURCE_ID);

    // Device detection from user agent
    const ua = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
    params.set('Device', isMobile ? 'Mobile' : 'Desktop');

    // Client IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || '';
    if (clientIP) params.set('ClientIP', clientIP);

    // User agent
    if (ua) params.set('UserAgent', ua);

    // Required fields
    if (data.zipcode) params.set('zipcode', data.zipcode);
    if (data.state) params.set('State', data.state.toUpperCase());

    // Credit score
    if (data.creditscore) {
      params.set('creditscore', CREDIT_MAP[data.creditscore] || data.creditscore);
    }

    // Financial fields
    if (data.loanbalance) params.set('loanbalance', String(parseCurrency(data.loanbalance)));
    if (data.propertyvalue) params.set('propertyvalue', String(parseCurrency(data.propertyvalue)));

    // Cash out
    if (data.cashout) params.set('CashOut', GOAL_TO_CASHOUT[data.cashout] || data.cashout);

    // Military status
    if (data.militarystatus) {
      params.set('MilitaryStatus', data.militarystatus === 'yes' ? 'Yes' : 'No');
    }

    // Property type
    if (data.propertytype) {
      params.set('PropertyType', PROPERTY_TYPE_MAP[data.propertytype] || data.propertytype);
    }

    // Property use
    if (data.propertyuse) {
      params.set('PropertyUse', PROPERTY_USE_MAP[data.propertyuse] || data.propertyuse);
    }

    // Employment status
    if (data.employmentstatus) {
      params.set('EmploymentStatus', EMPLOYMENT_MAP[data.employmentstatus] || data.employmentstatus);
    }

    // Media channel
    if (data.mediachannel) params.set('MediaChannel', data.mediachannel);

    // PII fields
    if (data.fname) params.set('FName', data.fname);
    if (data.lname) params.set('LName', data.lname);
    if (data.email) params.set('Email', data.email);
    if (data.phone) params.set('Phone', data.phone);
    if (data.address) params.set('Address', data.address);
    if (data.city) params.set('City', data.city);

    // Tracking
    const currentURL = req.headers['referer'] || '';
    if (currentURL) params.set('CurrentURL', currentURL);

    const url = `${MAO_API_URL}?${params.toString()}`;
    console.log('[MAO] Request URL:', url.replace(/FName=[^&]+/, 'FName=***').replace(/LName=[^&]+/, 'LName=***').replace(/Email=[^&]+/, 'Email=***').replace(/Phone=[^&]+/, 'Phone=***'));

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error('[MAO] API error:', response.status, response.statusText);
      return res.status(200).json({ items: [], error: 'MAO API returned an error' });
    }

    const result = await response.json();
    console.log('[MAO] Response: items =', result.items?.length || 0);

    // Return the MAO response directly — items array with listing details
    return res.status(200).json({
      items: result.items || [],
      searchResultId: result.searchResultId || null,
    });

  } catch (err) {
    console.error('[MAO] Error:', err.message);
    return res.status(200).json({ items: [], error: 'Failed to fetch listings' });
  }
}
