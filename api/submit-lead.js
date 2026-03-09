/* ============================================================
   Vercel Serverless Function — LeadPoint Server Post
   POST /api/submit-lead
   ============================================================ */

const LEADPOINT_URL = process.env.LEADPOINT_POST_URL || 'https://www.leadpointdelivery.com/20994/direct.ilp';
const AID = process.env.LEADPOINT_AID || '38212';
const TEST_MODE = process.env.LEADPOINT_TEST_MODE || '';

/* ── Field Mapping Tables ────────────────────────── */

const GOAL_TO_LOAN_PURP = {
  'lower-payment': 'lower_payment',
  'cash-out': 'take_out_cash',
  'shorten-term': 'change_terms',
  'consolidate': 'pay_off_debt',
};

const PROPERTY_TYPE_MAP = {
  'single-family': 'SINGLE_FAM',
  'condo': 'CONDO',
  'multi-family': 'MULTI_FAM',
  'manufactured': 'MOBILEHOME',
};

const CREDIT_MAP = {
  'excellent': 'EXCELLENT',
  'good': 'GOOD',
  'fair': 'FAIR',
  'poor': 'POOR',
};

/* ── Helpers ─────────────────────────────────────── */

function parseCurrency(val) {
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
}

function rateToRange(rateStr) {
  const rate = parseFloat(String(rateStr).replace(/%/g, ''));
  if (isNaN(rate) || rate <= 0) return '5-6';
  const low = Math.floor(rate);
  const high = low === rate ? low + 1 : Math.ceil(rate);
  return `${low}-${high}`;
}

function getCaptureTimePST() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${get('month')}/${get('day')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

/* ── ZIP → City/State Lookup ─────────────────────── */

async function lookupZip(zip) {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return { city: '', state: '' };
    const data = await res.json();
    const place = data.places?.[0];
    return {
      city: place?.['place name'] || '',
      state: place?.['state abbreviation'] || '',
    };
  } catch {
    return { city: '', state: '' };
  }
}

/* ── XML Response Parser ─────────────────────────── */

function parseLeadPointXML(xml) {
  const getTag = (tag) => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return match ? match[1].trim() : '';
  };

  const status = getTag('sm');

  const result = {
    status: status || 'UNKNOWN',
    leadId: getTag('lid'),
    channelId: getTag('ldaid'),
    buyers: [],
    errors: [],
    message: '',
  };

  if (status === 'OK') {
    result.numBuyers = parseInt(getTag('nb'), 10) || 0;
    result.amount = getTag('amt');

    // Parse <buyer> blocks
    const buyerRegex = /<buyer>([\s\S]*?)<\/buyer>/g;
    let buyerMatch;
    while ((buyerMatch = buyerRegex.exec(xml)) !== null) {
      const block = buyerMatch[1];
      const getInner = (tag) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].trim() : '';
      };
      result.buyers.push({
        name: getInner('bn'),
        logo: getInner('lu'),
        landingPage: getInner('lp'),
        redirect: getInner('redir'),
        description: getInner('dsc'),
        phone: getInner('ph'),
        email: getInner('em'),
      });
    }
  } else if (status === 'INVALID') {
    // INVALID: <err> contains sub-elements <name>, <value>, <type>
    const errRegex = /<err>([\s\S]*?)<\/err>/g;
    let errMatch;
    while ((errMatch = errRegex.exec(xml)) !== null) {
      const block = errMatch[1];
      const getInner = (tag) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].trim() : '';
      };
      const name = getInner('name');
      if (name) {
        result.errors.push({
          field: name,
          value: getInner('value'),
          type: getInner('type'),
        });
      }
    }
    result.message = 'One or more fields failed validation.';
  } else if (status === 'INTEGRATION_ERROR') {
    // INTEGRATION_ERROR: <err> is plain text
    const errText = getTag('err');
    result.message = errText || 'An integration error occurred.';
    result.errors = [{ field: '', value: '', type: errText }];
  } else if (status === 'QUALITY_VERIFICATION') {
    result.message = 'Your information is being verified.';
  } else if (status === 'QUEUED') {
    result.message = 'Your submission is being processed.';
  } else if (status === 'PENDING_MATCH') {
    result.message = 'No matching lenders at this time. Your lead is available in the aftermarket.';
  } else if (status === 'UNMATCHED') {
    result.message = 'No matching lenders found for your profile.';
  } else if (status === 'DUPLICATE') {
    result.message = 'This lead was previously submitted.';
  }

  return result;
}

/* ── Main Handler ────────────────────────────────── */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Server-side data
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    const captureTime = getCaptureTimePST();

    // ZIP → City/State lookup
    const zip = String(body.zip_code || '').replace(/\D/g, '');
    const { city, state } = await lookupZip(zip);

    if (!city || !state) {
      return res.status(422).json({
        status: 'CLIENT_ERROR',
        message: 'Could not determine city/state from ZIP code. Please verify your ZIP.',
        errors: [{ field: 'zip_code', type: 'LOOKUP_FAILED', value: zip }],
        buyers: [],
      });
    }

    // Build LeadPoint parameters
    const params = new URLSearchParams();

    // Fixed / server fields
    params.append('AID', AID);
    params.append('PRODUCT', 'PP_REFI');
    params.append('CAPTURE_TIME', captureTime);
    params.append('IP_ADDRESS', clientIP);

    // Personal info
    params.append('FNAME', (body.first_name || '').trim());
    params.append('LNAME', (body.last_name || '').trim());
    params.append('ADDRESS', (body.address || '').trim());
    params.append('CITY', city);
    params.append('STATE', state);
    params.append('ZIP', zip);
    params.append('PRI_PHON', String(body.phone || '').replace(/\D/g, ''));
    params.append('EMAIL', (body.email || '').trim().toLowerCase());

    // Property info
    params.append('CRED_GRADE', CREDIT_MAP[body.credit] || 'GOOD');
    params.append('PROP_DESC', PROPERTY_TYPE_MAP[body.property_type] || 'SINGLE_FAM');
    params.append('EST_VAL', String(parseCurrency(body.home_value)));
    params.append('BAL_ONE', String(parseCurrency(body.mortgage_balance)));

    // Loan info
    params.append('LOAN_TYPE', 'FIXED');
    params.append('LOAN_PURP', GOAL_TO_LOAN_PURP[body.goal] || 'lower_payment');
    params.append('ADD_CASH', String(parseCurrency(body.additional_cash)));
    params.append('VA_STATUS', body.va_status || 'NO');
    if (body.fha_loan) params.append('FHA_LOAN', body.fha_loan);
    if (body.income_proof) params.append('INCOME_PROOF', body.income_proof);
    if (body.bankruptcy) params.append('BANKRUPTCY', body.bankruptcy);
    if (body.mortgage_lates) params.append('MTG_LATES', body.mortgage_lates);

    // Property location (same as personal for refi)
    params.append('PROP_ZIP', zip);
    params.append('PROP_ST', state);

    // Compliance tokens
    if (body.trustedFormCertUrl) {
      params.append('XXTRUSTEDFORMCERTURL', body.trustedFormCertUrl);
    }
    if (body.srToken) {
      params.append('SR_TOKEN', body.srToken);
    }

    // Test mode
    if (TEST_MODE) {
      params.append('lp_test_mode', TEST_MODE);
    }

    // Log outgoing payload
    const paramString = params.toString();
    console.log('--- LEADPOINT REQUEST ---');
    console.log('URL:', LEADPOINT_URL);
    console.log('PARAMS:', Object.fromEntries(params.entries()));

    // POST to LeadPoint
    const lpResponse = await fetch(LEADPOINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: paramString,
    });

    const xmlText = await lpResponse.text();
    console.log('--- LEADPOINT RESPONSE ---');
    console.log('HTTP Status:', lpResponse.status);
    console.log('XML:', xmlText);

    const parsed = parseLeadPointXML(xmlText);
    console.log('PARSED:', JSON.stringify(parsed, null, 2));

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('LeadPoint submission error:', err);
    return res.status(500).json({
      status: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      errors: [],
      buyers: [],
    });
  }
}
