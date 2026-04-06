/* ============================================================
   Vercel Serverless Function — HELOC Lead (QuinStreet HELOC Post)
   POST /api/submit-heloc-lead
   ============================================================ */

// Environment variables — set in Vercel dashboard
const QS_STAGE_URL = 'https://guidetolenders.quinstage.com/plpost.jsp';
const QS_URL = process.env.QS_HELOC_URL || QS_STAGE_URL;
const QS_AUTH = process.env.QS_HELOC_AUTH || 'Basic ZHJlZGR5:QnJzbm5yczY4Iw==';
const QS_TOKEN = process.env.QS_HELOC_TOKEN || 'MjAzMDY2MTA=';
const QS_AFN = process.env.QS_HELOC_AFN || 'offerconversion';
const QS_AF = process.env.QS_HELOC_AF || '79649044';
const IS_STAGE = !process.env.QS_HELOC_URL; // true when using stage endpoint

/* ── Field Mapping Tables ────────────────────────── */

const PROPERTY_TYPE_MAP = {
  'single-family': 'Single',
  'condo': 'Townhouse',
  'condominium': 'Condo',
  'multi-family': 'Multi',
  'manufactured': 'Mobile',
};

const PROPERTY_USE_MAP = {
  'primary': 'Primary Residence',
  'secondary': 'Secondary Home',
  'rental': 'Rental Property',
};

const HELOC_PURPOSE_MAP = {
  'renovation': 'Home Renovation',
  'consolidate': 'Debt Consolidation',
  'investment': 'Investment Purposes',
  'retirement': 'Retirement Income',
  'cash': 'Personal',
  'other': 'Personal',
};

const MORTGAGE_STATUS_MAP = {
  'none': 'No',
  'one': 'One',
  'two': 'Two',
};

const BANKRUPTCY_MAP = {
  'no': 'No',
  'bankruptcy': 'Bankruptcy',
  'foreclosure': 'Foreclosure',
  'both': 'Both',
};

const CREDIT_MAP = {
  'excellent': 'Excellent',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
};

/* ── Helpers ─────────────────────────────────────── */

function parseCurrency(val) {
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
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

    const userAgent = req.headers['user-agent'] || '';

    // ZIP → City/State lookup
    const zip = String(body.zip_code || '').replace(/\D/g, '');
    const { city, state } = await lookupZip(zip);

    if (!city || !state) {
      return res.status(422).json({
        status: 'Failure',
        message: 'Could not determine city/state from ZIP code. Please verify your ZIP.',
        errors: [{ field: 'zip_code', type: 'LOOKUP_FAILED', value: zip }],
      });
    }

    // Parse currency values
    const cashOut = parseCurrency(body.heloc_amount);
    const income = parseCurrency(body.annual_income);
    const propertyValue = parseCurrency(body.home_value);
    const mortgageBalance1 = body.existing_mortgages === 'none' ? 0 : parseCurrency(body.mortgage_balance);
    const mortgageBalance2 = body.existing_mortgages === 'two' ? parseCurrency(body.mortgage_balance_2) : 0;

    // Build QuinStreet HELOC JSON payload
    const qsPayload = {
      // Fixed fields
      service: 'HELOC',
      AFN: QS_AFN,
      AF: QS_AF,
      getTYLink: 'No',

      // Loan details
      LoanPurpose: HELOC_PURPOSE_MAP[body.heloc_purpose] || 'Personal',
      CashOut: String(cashOut),
      Income: String(income),

      // Property info
      PropertyType: PROPERTY_TYPE_MAP[body.property_type] || 'Single',
      PropertyUse: PROPERTY_USE_MAP[body.property_use] || 'Primary Residence',
      PropertyValue: String(propertyValue),
      MortgageStatus: MORTGAGE_STATUS_MAP[body.existing_mortgages] || 'No',
      MortgageBalance1: String(mortgageBalance1),
      MortgageBalance2: String(mortgageBalance2),

      // Personal info
      Military: body.va_status === 'YES' ? 'Yes' : 'No',
      BankruptcyFlag: BANKRUPTCY_MAP[body.bankruptcy] || 'No',
      EmploymentStatus: body.employment_status || '7',
      OwnHome: body.own_home || 'Homeowner',
      TimeAtResidence: body.time_at_residence || 'More 3 years',

      // Credit (optional per spec but we have it)
      CreditRating: CREDIT_MAP[body.credit] || 'Good',

      // Contact info
      Email: (body.email || '').trim().toLowerCase(),
      Dob: (body.dob || '').trim(),
      Fname: (body.first_name || '').trim(),
      Lname: (body.last_name || '').trim(),
      HomePhone: String(body.phone || '').replace(/\D/g, ''),
      PostalCode: zip,
      Street: (body.address || '').trim(),
      City: city,
      State: state,

      // Consent
      PhoneConsentLang: 'TCPA',
    };

    // Compliance tokens — use LeadIdToken or ap_token (at least one required)
    if (body.srToken) {
      qsPayload.LeadIdToken = body.srToken;
    }
    if (body.trustedFormCertUrl) {
      qsPayload.ap_token = body.trustedFormCertUrl;
    }
    // Fallback: if neither token available, default PhoneConsentLang
    if (!qsPayload.LeadIdToken && !qsPayload.ap_token) {
      qsPayload.PhoneConsentLang = 'TCPA';
    }

    // Stage testing requires AID for Solution Center matching
    if (IS_STAGE) {
      qsPayload.AID = '104523';
    }

    // Log outgoing payload (redact PII in production)
    console.log('--- HELOC QUINSTREET REQUEST ---');
    console.log('URL:', QS_URL);
    console.log('PAYLOAD:', JSON.stringify({
      ...qsPayload,
      Email: '***',
      Fname: '***',
      Lname: '***',
      HomePhone: '***',
      Dob: '***',
      Street: '***',
    }, null, 2));

    // POST to QuinStreet
    const qsResponse = await fetch(QS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${QS_AUTH} Token ${QS_TOKEN}`,
        'True-Client-IP': clientIP,
        'User-Agent': userAgent,
      },
      body: JSON.stringify(qsPayload),
    });

    const responseText = await qsResponse.text();
    console.log('--- HELOC QUINSTREET RESPONSE ---');
    console.log('HTTP Status:', qsResponse.status);
    console.log('Body:', responseText);

    // Parse response
    let qsResult;
    try {
      qsResult = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse QuinStreet response as JSON:', responseText);
      return res.status(200).json({
        status: 'SERVER_ERROR',
        message: 'Received an unexpected response from the lender network. Please try again.',
        errors: [],
        buyers: [],
      });
    }

    // Normalize response for frontend
    const normalized = normalizeResponse(qsResult, body);
    console.log('NORMALIZED:', JSON.stringify(normalized, null, 2));

    return res.status(200).json(normalized);
  } catch (err) {
    console.error('HELOC QuinStreet submission error:', err);
    return res.status(500).json({
      status: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      errors: [],
      buyers: [],
    });
  }
}

/* ── Response Normalizer ─────────────────────────── */

function normalizeResponse(qsResult, originalBody) {
  const status = qsResult.Status;
  const leadId = qsResult.LeadID;
  const reason = qsResult.Reason;

  // Success with offers (getTYLink=No returns listingset)
  if (status === 'Success' && qsResult.listingset) {
    const listings = qsResult.listingset.listing || [];
    const buyers = listings.map(listing => ({
      name: listing.displayname || '',
      logo: listing.logo || '',
      landingPage: listing.clickurl || '',
      description: listing.offer_details?.learnMoreText || '',
      rank: listing.rank,
      offerDetails: listing.offer_details ? {
        loanAmount: listing.offer_details.loanAmount,
        apr: listing.offer_details.apr,
        monthlyPayment: listing.offer_details.monthlyPayment,
        loanTerm: listing.offer_details.loanTerm,
        interestRate: listing.offer_details.interestRate,
        cta: listing.offer_details.cta,
        banner: listing.offer_details.banner,
        originationFee: listing.offer_details.originationFee,
        offerType: listing.offer_details.offerType,
      } : null,
      impPixel: listing.imp_pixel || '',
    }));

    return {
      status: 'OK',
      leadId,
      matchType: qsResult.MatchType,
      commission: qsResult.Commision,
      buyers,
      errors: [],
      message: '',
      listingset: qsResult.listingset,
    };
  }

  // Success with TYPageLink (getTYLink=Yes)
  if (status === 'Success' && qsResult.TYPageLink) {
    return {
      status: 'OK',
      leadId,
      matchType: qsResult.MatchType,
      tyPageLink: decodeURIComponent(qsResult.TYPageLink),
      buyers: [],
      errors: [],
      message: '',
    };
  }

  // Success without offers
  if (status === 'Success') {
    return {
      status: 'OK',
      leadId,
      matchType: qsResult.MatchType || 'no-match',
      buyers: [],
      errors: [],
      message: '',
    };
  }

  // Confirmation needed (credit profile no-hit flow)
  if (reason && reason.includes('Confirmation-Need confirmation of PII')) {
    return {
      status: 'CONFIRMATION_NEEDED',
      leadId,
      message: 'Additional verification is needed. Please provide your SSN to complete the application.',
      dataCaptureKey: leadId,
      errors: [],
      buyers: [],
    };
  }

  // No vendor matches
  if (reason && reason.includes('No vendor matches')) {
    return {
      status: 'UNMATCHED',
      leadId,
      message: 'No matching lenders found for your profile at this time.',
      errors: [],
      buyers: [],
    };
  }

  // Failure with specific reason
  if (status === 'Failure') {
    return {
      status: 'INVALID',
      leadId,
      message: reason || 'Your submission could not be processed.',
      errors: reason ? [{ field: '', type: reason, value: '' }] : [],
      buyers: [],
    };
  }

  // Fallback
  return {
    status: 'UNKNOWN',
    leadId: leadId || '',
    message: reason || 'An unexpected response was received.',
    errors: [],
    buyers: [],
  };
}
