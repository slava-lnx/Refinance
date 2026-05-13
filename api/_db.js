/* ============================================================
   Shared Database Helper — Neon Postgres (Vercel Postgres)
   ============================================================ */

import { neon } from '@neondatabase/serverless';

let _sql = null;

function getSQL() {
  if (!_sql) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!url) throw new Error('Missing POSTGRES_URL or DATABASE_URL env var');
    _sql = neon(url);
  }
  return _sql;
}

/* ── Auto-create tables on first call ────────────── */

let _initialized = false;

async function ensureTables() {
  if (_initialized) return;
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id            SERIAL PRIMARY KEY,
      funnel        VARCHAR(20) NOT NULL DEFAULT 'refi',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Personal info
      first_name    VARCHAR(100),
      last_name     VARCHAR(100),
      email         VARCHAR(255),
      phone         VARCHAR(20),
      address       TEXT,
      city          VARCHAR(100),
      state         VARCHAR(2),
      zip_code      VARCHAR(10),

      -- Property & loan (shared)
      goal          VARCHAR(50),
      property_type VARCHAR(50),
      property_use  VARCHAR(50),
      home_value    INTEGER,
      mortgage_balance INTEGER,
      additional_cash  INTEGER,
      credit_score  VARCHAR(20),
      va_status     VARCHAR(10),
      fha_loan      VARCHAR(10),
      income_proof  VARCHAR(10),
      bankruptcy    VARCHAR(10),
      mortgage_lates VARCHAR(10),

      -- HELOC-specific
      heloc_amount     INTEGER,
      heloc_purpose    VARCHAR(50),
      annual_income    INTEGER,
      existing_mortgages VARCHAR(20),
      mortgage_balance_2 INTEGER,
      employment_status VARCHAR(50),
      own_home         VARCHAR(50),
      time_at_residence VARCHAR(50),
      dob              VARCHAR(20),

      -- Submission results
      lead_status   VARCHAR(50),
      lead_id       VARCHAR(100),
      lead_revenue  VARCHAR(50),
      num_buyers    INTEGER DEFAULT 0,

      -- Tracking
      ip_address    VARCHAR(45),
      user_agent    TEXT,
      source        VARCHAR(100),
      utm_source    VARCHAR(100),
      utm_medium    VARCHAR(100),
      utm_campaign  VARCHAR(100),

      -- Compliance
      trusted_form_url TEXT,
      sr_token      TEXT
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_leads_state ON leads (state)
  `;

  _initialized = true;
}

/* ── Public API ──────────────────────────────────── */

export async function saveLead(data) {
  await ensureTables();
  const sql = getSQL();

  const result = await sql`
    INSERT INTO leads (
      funnel, first_name, last_name, email, phone,
      address, city, state, zip_code,
      goal, property_type, property_use, home_value, mortgage_balance, additional_cash,
      credit_score, va_status, fha_loan, income_proof, bankruptcy, mortgage_lates,
      heloc_amount, heloc_purpose, annual_income, existing_mortgages,
      mortgage_balance_2, employment_status, own_home, time_at_residence, dob,
      lead_status, lead_id, lead_revenue, num_buyers,
      ip_address, user_agent, source,
      utm_source, utm_medium, utm_campaign,
      trusted_form_url, sr_token
    ) VALUES (
      ${data.funnel || 'refi'},
      ${data.first_name || null},
      ${data.last_name || null},
      ${data.email || null},
      ${data.phone || null},
      ${data.address || null},
      ${data.city || null},
      ${data.state || null},
      ${data.zip_code || null},
      ${data.goal || null},
      ${data.property_type || null},
      ${data.property_use || null},
      ${data.home_value || null},
      ${data.mortgage_balance || null},
      ${data.additional_cash || null},
      ${data.credit_score || null},
      ${data.va_status || null},
      ${data.fha_loan || null},
      ${data.income_proof || null},
      ${data.bankruptcy || null},
      ${data.mortgage_lates || null},
      ${data.heloc_amount || null},
      ${data.heloc_purpose || null},
      ${data.annual_income || null},
      ${data.existing_mortgages || null},
      ${data.mortgage_balance_2 || null},
      ${data.employment_status || null},
      ${data.own_home || null},
      ${data.time_at_residence || null},
      ${data.dob || null},
      ${data.lead_status || null},
      ${data.lead_id || null},
      ${data.lead_revenue || null},
      ${data.num_buyers || 0},
      ${data.ip_address || null},
      ${data.user_agent || null},
      ${data.source || null},
      ${data.utm_source || null},
      ${data.utm_medium || null},
      ${data.utm_campaign || null},
      ${data.trusted_form_url || null},
      ${data.sr_token || null}
    )
    RETURNING id
  `;

  return result[0]?.id;
}
