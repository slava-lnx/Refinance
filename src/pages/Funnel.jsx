import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { identifyChatbaseUser } from '../components/ChatbaseWidget';

/* ============================================================
   Formatting Helpers
   ============================================================ */

function formatCurrency(raw) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return '$' + Number(digits).toLocaleString('en-US');
}

function parseCurrencyToNumber(formatted) {
  return Number(formatted.replace(/\D/g, '')) || 0;
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatRate(raw) {
  // Allow digits, one decimal point
  let cleaned = raw.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
  if (cleaned && !cleaned.endsWith('.')) {
    const num = parseFloat(cleaned);
    if (num > 24) cleaned = '24';
  }
  return cleaned ? cleaned + '%' : '';
}

function stripRate(val) {
  return val.replace(/%/g, '');
}

/* ============================================================
   Common Email Typos (LeadPoint flags these)
   ============================================================ */

const EMAIL_DOMAIN_CORRECTIONS = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com', 'ggmail.com': 'gmail.com', 'gmail.coms': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'yahoo.co': 'yahoo.com', 'hotmal.com': 'hotmail.com', 'hotmail.con': 'hotmail.com',
  'outloo.com': 'outlook.com', 'outlook.con': 'outlook.com',
};

function detectEmailTypo(email) {
  const parts = email.trim().split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1].toLowerCase();
  return EMAIL_DOMAIN_CORRECTIONS[domain]
    ? `Did you mean ${parts[0]}@${EMAIL_DOMAIN_CORRECTIONS[domain]}?`
    : null;
}

/* ============================================================
   Steps Configuration
   ============================================================ */

const STEPS = [
  {
    id: 'goal',
    label: 'Step 1 of 8',
    progressLabel: 'Goal',
    title: 'What is your refinance goal?',
    subtitle: 'This helps our AI match you with the right lenders.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ), label: 'Lower my monthly payment', value: 'lower-payment' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ), label: 'Cash out home equity', value: 'cash-out' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), label: 'Shorten my loan term', value: 'shorten-term' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ), label: 'Consolidate debt', value: 'consolidate' },
    ],
  },
  {
    id: 'email-capture',
    label: 'Step 2 of 8',
    progressLabel: 'Email',
    title: 'Where should we send your offers?',
    subtitle: "Enter your email so we can start matching you — we'll never spam you.",
    type: 'form',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', autoComplete: 'email', inputMode: 'email', enterKeyHint: 'next' },
    ],
  },
  {
    id: 'property-type',
    label: 'Step 3 of 8',
    progressLabel: 'Property',
    title: 'What type of property is it?',
    subtitle: 'Select the type that best describes your home.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 11 12 2 2 11"/><path d="M6 11v9a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-9"/>
        </svg>
      ), label: 'Single Family Home', value: 'single-family' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="2" x2="10" y2="22"/>
        </svg>
      ), label: 'Condo / Townhome', value: 'condo' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 11 12 2 2 11"/><path d="M6 11v9a1 1 0 001 1h3v-4h4v4h3a1 1 0 001-1v-9"/><line x1="12" y1="2" x2="12" y2="2"/>
          <polyline points="18 8 22 11"/>
        </svg>
      ), label: 'Multi-Family (2-4 units)', value: 'multi-family' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="12" rx="1"/><polyline points="2 14 22 14"/><line x1="6" y1="8" x2="6" y2="4"/><line x1="18" y1="8" x2="18" y2="4"/>
        </svg>
      ), label: 'Manufactured Home', value: 'manufactured' },
    ],
  },
  {
    id: 'home-value',
    label: 'Step 4 of 8',
    progressLabel: 'Value',
    title: 'Estimated home value?',
    subtitle: "Your best estimate is fine — we'll verify later.",
    type: 'form',
    fields: [
      { name: 'home_value', label: 'Home Value', type: 'text', placeholder: '$350,000', autoComplete: 'off', inputMode: 'numeric', enterKeyHint: 'next' },
      { name: 'mortgage_balance', label: 'Current Mortgage Balance', type: 'text', placeholder: '$250,000', autoComplete: 'off', inputMode: 'numeric', enterKeyHint: 'next' },
      { name: 'current_rate', label: 'Current Interest Rate', type: 'text', placeholder: '6.5%', autoComplete: 'off', inputMode: 'decimal', enterKeyHint: 'next' },
    ],
  },
  {
    id: 'cash-out',
    label: 'Step 5 of 8',
    progressLabel: 'Cash',
    title: 'Want to access extra cash?',
    subtitle: 'Tap into your home equity — many homeowners use it for renovations, debt payoff, or a financial cushion.',
    type: 'slider',
  },
  {
    id: 'credit',
    label: 'Step 6 of 8',
    progressLabel: 'Credit',
    title: 'Estimated credit score?',
    subtitle: "This won't affect your credit. We just need a range.",
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'Excellent (740+)', value: 'excellent' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ), label: 'Good (680\u2013739)', value: 'good' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Fair (620\u2013679)', value: 'fair' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'Below 620', value: 'poor' },
    ],
  },
  {
    id: 'zip',
    label: 'Step 7 of 8',
    progressLabel: 'Location',
    title: 'Where is your property located?',
    subtitle: 'Rates vary by location \u2014 this helps us find local offers.',
    type: 'form',
    fields: [
      { name: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main St', autoComplete: 'off', enterKeyHint: 'next' },
      { name: 'zip_code', label: 'Property ZIP Code', type: 'text', placeholder: '90210', maxLength: 5, autoComplete: 'postal-code', inputMode: 'numeric', enterKeyHint: 'next' },
    ],
  },
  {
    id: 'contact',
    label: 'Step 8 of 8 \u2014 Almost Done!',
    progressLabel: 'Contact',
    title: 'Complete your profile to see rates',
    subtitle: 'Just a few more details and we\'ll have your personalized rates ready.',
    type: 'form',
    hasConsent: true,
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John', autoComplete: 'given-name', enterKeyHint: 'next' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Smith', autoComplete: 'family-name', enterKeyHint: 'next' },
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', autoComplete: 'tel', inputMode: 'tel', enterKeyHint: 'done' },
    ],
  },
];

/* ============================================================
   Progress Bar
   ============================================================ */

function SteppedProgress({ currentStep, totalSteps }) {
  const fillPercent = currentStep / (totalSteps - 1) * 100;

  return (
    <div className="funnel-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
      <div className="progress-steps">
        <div
          className="progress-fill-track"
          style={{ width: `calc(${fillPercent / 100} * (100% - 48px))` }}
        />
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`progress-step${i === currentStep ? ' active' : ''}${i < currentStep ? ' completed' : ''}`}
          >
            <div className="progress-dot" aria-hidden="true">
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            <span className="progress-step-label">{step.progressLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Option Step (accessible)
   ============================================================ */

function OptionStep({ step, formData, onSelect }) {
  const handleKeyDown = (e, value) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(step.id, value);
    }
  };

  return (
    <div className="funnel-options" role="radiogroup" aria-label={step.title}>
      {step.options.map(opt => {
        const isSelected = formData[step.id] === opt.value;
        return (
          <div
            key={opt.value}
            className={`funnel-option${isSelected ? ' selected' : ''}`}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onSelect(step.id, opt.value)}
            onKeyDown={(e) => handleKeyDown(e, opt.value)}
          >
            <span className="option-icon" aria-hidden="true">{opt.icon}</span>
            <span className="option-label">{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Cash-Out Slider Step
   ============================================================ */

function CashOutStep({ formData, onChange }) {
  const rawValue = parseCurrencyToNumber(formData['additional_cash'] || '$0');
  const displayValue = rawValue.toLocaleString('en-US');

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    onChange('additional_cash', val === 0 ? '$0' : '$' + val.toLocaleString('en-US'));
  };

  // Estimate: ~$4/mo per $1,000 borrowed (rough 30yr fixed @ ~5-6%)
  const estMonthly = Math.round(rawValue * 4 / 1000);

  return (
    <div className="cashout-step">
      <div className="cashout-amount-display">
        <span className="cashout-dollar">${displayValue}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100000}
        step={5000}
        value={rawValue}
        onChange={handleSlider}
        className="cashout-slider"
        aria-label="Additional cash amount"
      />

      <div className="cashout-range-labels">
        <span>$0</span>
        <span>$100,000</span>
      </div>

      {rawValue > 0 && (
        <div className="cashout-estimate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Estimated additional ~<strong>${estMonthly}/mo</strong> to your payment</span>
        </div>
      )}

      <div className="cashout-pitch">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <p>Homeowners use cash-out to pay off high-interest debt, fund home improvements, or build a financial safety net — often at a fraction of credit card rates.</p>
      </div>
    </div>
  );
}

/* ============================================================
   Form Step (accessible, masked inputs, blur validation)
   ============================================================ */

function FormStep({ step, formData, onChange, onBlur, errors = {}, validated = {}, emailSuggestion, onAcceptEmailSuggestion, firstFieldRef }) {
  return (
    <>
      {step.fields.map((field, idx) => {
        const hasError = !!errors[field.name];
        const isValid = !hasError && !!validated[field.name];
        return (
          <div key={field.name} className={`form-group${hasError ? ' has-error' : ''}${isValid ? ' has-valid' : ''}`}>
            <label htmlFor={`field-${field.name}`}>{field.label}</label>
            <div className="input-wrap">
              <input
                ref={idx === 0 ? firstFieldRef : undefined}
                id={`field-${field.name}`}
                type={field.type}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={formData[field.name] || ''}
                onChange={e => onChange(field.name, e.target.value)}
                onBlur={() => onBlur(field.name)}
                autoComplete={field.autoComplete || 'off'}
                inputMode={field.inputMode}
                enterKeyHint={field.enterKeyHint}
                aria-invalid={hasError ? 'true' : undefined}
                aria-describedby={hasError ? `error-${field.name}` : undefined}
                style={hasError ? { borderColor: '#EF4444' } : isValid ? { borderColor: '#10B981' } : undefined}
              />
              {isValid && (
                <span className="field-valid-check" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </div>
            {hasError && (
              <span id={`error-${field.name}`} className="field-error" role="alert">
                {errors[field.name]}
              </span>
            )}
            {field.name === 'email' && emailSuggestion && !hasError && (
              <button type="button" className="email-suggestion" onClick={onAcceptEmailSuggestion}>
                {emailSuggestion}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ============================================================
   Consent Block (custom checkbox)
   ============================================================ */

function ConsentBlock({ agreed, onChange, error }) {
  return (
    <div className={`consent-block${error ? ' consent-error' : ''}`}>
      <label className="consent-label" onClick={e => { e.preventDefault(); onChange(!agreed); }}>
        <span
          className={`custom-checkbox${agreed ? ' checked' : ''}`}
          role="checkbox"
          aria-checked={agreed}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!agreed); } }}
        >
          {agreed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </span>
        <input type="checkbox" id="leadid_tcpa_disclosure" checked={agreed} readOnly className="sr-only" tabIndex={-1} aria-hidden="true" />
        <span>
          By submitting, I agree to the <Link to="/terms-of-service" target="_blank">Terms of Service</Link> and{' '}
          <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>, and consent to be contacted by
          GetMyRefinance and its lending partners by phone, email, or text at the number provided, including
          via automated technology. This is not a condition of purchase. Msg & data rates may apply.
        </span>
      </label>
      {error && <span className="field-error consent-error-msg" role="alert">{error}</span>}
    </div>
  );
}

/* ============================================================
   AI Matching Message
   ============================================================ */

function AIMatchingMessage() {
  return (
    <div className="ai-matching">
      <div className="ai-matching-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M8 14s1.5 2 4 2 4-2 4-2"/>
        </svg>
      </div>
      <span>
        Our AI analyzes your profile against <strong>25+ lender programs</strong> to find you the best possible offer — in seconds, not days.
      </span>
    </div>
  );
}

/* ============================================================
   Social Proof
   ============================================================ */

function SocialProof() {
  return (
    <div className="social-proof" aria-label="Social proof">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
      <span>3,247 homeowners matched this week</span>
    </div>
  );
}

/* ============================================================
   Trust Badges (on final submit step)
   ============================================================ */

function TrustBadges() {
  return (
    <div className="trust-badges">
      <div className="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span>256-bit SSL Encrypted</span>
      </div>
      <div className="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Won't affect your credit</span>
      </div>
      <div className="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>No obligation</span>
      </div>
    </div>
  );
}

/* ============================================================
   Processing Screen
   ============================================================ */

function ProcessingScreen() {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    { text: 'Analyzing your profile...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
    { text: 'Scanning 25+ lender programs...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )},
    { text: 'Comparing rates & terms...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    )},
    { text: 'Finding your best match...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { text: 'Preparing your results...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )},
  ];

  useEffect(() => {
    let prog = 0;
    const progressInterval = setInterval(() => {
      prog += Math.random() * 3 + 0.5;
      if (prog > 100) prog = 100;
      setProgress(prog);
      if (prog >= 100) clearInterval(progressInterval);
    }, 120);

    const phaseInterval = setInterval(() => {
      setPhase(p => {
        if (p >= phases.length - 1) { clearInterval(phaseInterval); return p; }
        return p + 1;
      });
    }, 1200);

    return () => { clearInterval(progressInterval); clearInterval(phaseInterval); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }} role="status" aria-live="polite">
      <div style={{ marginBottom: 32 }}>
        <div className="processing-spinner">
          <span style={{ animation: 'none' }}>{phases[phase].icon}</span>
        </div>
      </div>

      <h2 style={{ marginBottom: 8, fontSize: '1.4rem', color: 'var(--color-primary)' }}>
        Our AI Is Working For You
      </h2>
      <p style={{
        marginBottom: 28, fontSize: '0.92rem', color: 'var(--color-text-light)',
        minHeight: 28, transition: 'opacity 0.3s',
      }}>
        {phases[phase].text}
      </p>

      <div className="processing-bar-track">
        <div className="processing-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {Math.round(progress)}% complete
      </div>

      <div style={{
        marginTop: 32, textAlign: 'left', maxWidth: 320, margin: '32px auto 0',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'center',
            opacity: i <= phase ? 1 : 0.3,
            transition: 'opacity 0.4s ease',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', fontSize: '0.65rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: i < phase ? 'var(--color-primary-mid)' : i === phase ? 'var(--color-secondary)' : 'var(--color-border)',
              color: i <= phase ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 700,
              transition: 'all 0.3s',
            }}>
              {i < phase ? '\u2713' : i === phase ? '...' : (i + 1)}
            </span>
            <span style={{
              fontSize: '0.85rem', fontWeight: i === phase ? 600 : 400,
              color: i <= phase ? 'var(--color-text)' : 'var(--color-text-muted)',
            }}>
              {p.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Success Screen
   ============================================================ */

function ResultsScreen({ result, formData, onRetry }) {
  if (!result) return null;

  const { status, buyers, message, errors } = result;

  // OK — matched with buyer(s)
  if (status === 'OK' && buyers?.length > 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 8 }}>Great News, {formData.first_name || 'there'}!</h2>
        <p style={{ marginBottom: 24, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          We matched you with {buyers.length} lender{buyers.length > 1 ? 's' : ''} based on your profile.
          They will be reaching out to you shortly with personalized offers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {buyers.map((buyer, i) => (
            <div key={i} className="buyer-card">
              <div className="buyer-card-header">
                {buyer.logo && buyer.logo !== '-1' && <img src={buyer.logo} alt={buyer.name} className="buyer-logo" />}
                <strong className="buyer-name">{buyer.name}</strong>
              </div>
              {buyer.description && <p className="buyer-desc">{buyer.description}</p>}
              {(buyer.landingPage || buyer.redirect) && (
                <a href={buyer.redirect || buyer.landingPage} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 12 }}>
                  View My Offer
                </a>
              )}
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>What happens next:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', maxWidth: 380, margin: '0 auto' }}>
            {['Matched lenders will contact you within minutes', 'Compare their personalized rate offers', 'Choose the best option \u2014 zero obligation'].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{'\u2713'}</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--color-text-light)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
      </div>
    );
  }

  // OK but no buyers (shouldn't happen, but handle gracefully)
  if (status === 'OK') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 12 }}>You're All Set!</h2>
        <p style={{ marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Your information has been submitted. Matched lenders will reach out to you shortly with personalized offers.
        </p>
        <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
      </div>
    );
  }

  // QUALITY_VERIFICATION / QUEUED — pending processing
  if (status === 'QUALITY_VERIFICATION' || status === 'QUEUED') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 12 }}>We're Working On It!</h2>
        <p style={{ marginBottom: 12, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          {status === 'QUALITY_VERIFICATION'
            ? 'Your information is being verified. You will receive offers once verification is complete.'
            : 'We are processing your request. Matched lenders will reach out to you soon.'}
        </p>
        <p style={{ marginBottom: 32, fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Check your email at <strong>{formData.email}</strong> for updates.
        </p>
        <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
      </div>
    );
  }

  // PENDING_MATCH / UNMATCHED — no lender matched
  if (status === 'PENDING_MATCH' || status === 'UNMATCHED') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 12 }}>No Matches Right Now</h2>
        <p style={{ marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Unfortunately, we couldn't find a matching lender for your profile at this time.
          Lender availability changes frequently — consider trying again in a few days.
        </p>
        <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
      </div>
    );
  }

  // DUPLICATE — already submitted
  if (status === 'DUPLICATE') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 12 }}>Already Submitted</h2>
        <p style={{ marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          It looks like we already have your information on file. The lenders we matched you with
          previously should be reaching out soon. Check your email and phone for their offers.
        </p>
        <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
      </div>
    );
  }

  // INVALID / INTEGRATION_ERROR / SERVER_ERROR / NETWORK_ERROR / CLIENT_ERROR — errors with retry
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 style={{ marginBottom: 12 }}>Something Went Wrong</h2>
      <p style={{ marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        {message || 'We encountered an error processing your request. Please try again.'}
      </p>
      {errors?.length > 0 && errors[0]?.field && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 24, textAlign: 'left', maxWidth: 400, margin: '0 auto 24px' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, color: '#EF4444' }}>Details:</p>
          {errors.map((err, i) => (
            <p key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: 4 }}>
              {err.field}: {err.type}{err.value ? ` (submitted: "${err.value}")` : ''}
            </p>
          ))}
        </div>
      )}
      <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
    </div>
  );
}

/* ============================================================
   Exit Intent Modal
   ============================================================ */

function ExitIntentModal({ onStay }) {
  return (
    <div className="exit-intent-overlay" role="dialog" aria-modal="true" aria-label="Are you sure you want to leave?">
      <div className="exit-intent-modal">
        <h3>Wait! You're almost there</h3>
        <p>You're just steps away from seeing your personalized refinance rates. Don't miss out on potential savings!</p>
        <div className="exit-intent-actions">
          <button className="btn btn-primary" onClick={onStay}>Keep Going</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Validation
   ============================================================ */

function hasBogusLetters(str) {
  const s = str.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!s || s.length < 3) return false;
  // All same letter (e.g. "aaaa")
  if (/^(.)\1+$/.test(s)) return true;
  // Repeating 2-char pattern (e.g. "dfdfdf", "ababab")
  if (/^(.{2})\1{2,}$/.test(s)) return true;
  // Keyboard mash patterns
  if (/^(asdf|qwer|zxcv|jkl|fdsa|rewq)/i.test(s)) return true;
  return false;
}

const validators = {
  address: v => {
    if (!v.trim()) return 'Please enter your street address.';
    if (v.trim().length < 5) return 'Please enter a valid street address.';
    if (hasBogusLetters(v)) return 'Please enter a real street address.';
    return true;
  },
  email: v => {
    if (!v.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address.';
    return true;
  },
  phone: v => {
    if (!v.trim()) return 'Please enter your phone number.';
    const digits = v.replace(/\D/g, '');
    if (digits.length !== 10) return 'Please enter a valid 10-digit phone number.';
    return true;
  },
  zip_code: v => {
    if (!v.trim()) return 'Please enter your ZIP code.';
    if (!/^\d{5}$/.test(v.trim())) return 'Please enter a valid 5-digit ZIP code.';
    return true;
  },
  home_value: v => {
    const num = parseCurrencyToNumber(v);
    if (!v.trim() || num === 0) return 'Please enter your estimated home value.';
    if (num < 50000) return 'Home value must be at least $50,000.';
    if (num > 5000000) return 'Home value cannot exceed $5,000,000.';
    return true;
  },
  mortgage_balance: v => {
    const num = parseCurrencyToNumber(v);
    if (!v.trim() || num === 0) return 'Please enter your current mortgage balance.';
    if (num < 50000) return 'Mortgage balance must be at least $50,000.';
    if (num > 5000000) return 'Mortgage balance cannot exceed $5,000,000.';
    return true;
  },
  current_rate: v => {
    const stripped = stripRate(v);
    if (!stripped) return 'Please enter your current interest rate.';
    const num = parseFloat(stripped);
    if (isNaN(num) || num <= 0) return 'Please enter a valid interest rate.';
    if (num > 24) return 'Interest rate cannot exceed 24%.';
    return true;
  },
  first_name: v => {
    if (!v.trim()) return 'Please enter your first name.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (/\d/.test(v)) return 'Name cannot contain numbers.';
    if (hasBogusLetters(v)) return 'Please enter a real name.';
    return true;
  },
  last_name: v => {
    if (!v.trim()) return 'Please enter your last name.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (/\d/.test(v)) return 'Name cannot contain numbers.';
    if (hasBogusLetters(v)) return 'Please enter a real name.';
    return true;
  },
};

function validateStep(step, formData) {
  const errors = {};
  if (step.type === 'form') {
    for (const field of step.fields) {
      const value = formData[field.name] || '';
      const validate = validators[field.name];
      if (validate) {
        const result = validate(value);
        if (result !== true) errors[field.name] = result;
      }
    }
  }
  return errors;
}

/* ============================================================
   Session Storage Persistence
   ============================================================ */

const STORAGE_KEY = 'gmr_funnel_progress';

function saveProgress(step, formData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function loadProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - data.ts > 30 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function clearProgress() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/* ============================================================
   Main Funnel Component
   ============================================================ */

export default function Funnel() {
  const location = useLocation();
  const initialData = location.state || {};
  const firstFieldRef = useRef(null);

  const goalMap = {
    'lower-payment': 'lower-payment',
    'lower-rate': 'lower-payment',
    'cash-out': 'cash-out',
    'shorten-term': 'shorten-term',
    'consolidate': 'consolidate',
  };

  // Restore from session or from route state
  const savedProgress = loadProgress();
  const prefilledData = {};
  if (initialData.goal) prefilledData['goal'] = goalMap[initialData.goal] || initialData.goal;
  if (initialData.home_value) prefilledData['home_value'] = initialData.home_value;
  if (initialData.mortgage_balance) prefilledData['mortgage_balance'] = initialData.mortgage_balance;
  if (initialData.zip_code) prefilledData['zip_code'] = initialData.zip_code;

  const hasRouteState = Object.keys(prefilledData).length > 0;
  const restoredData = hasRouteState ? prefilledData : (savedProgress?.formData || prefilledData);
  const restoredStep = hasRouteState ? 0 : (savedProgress?.step || 0);

  const [currentStep, setCurrentStep] = useState(restoredStep);
  const [formData, setFormData] = useState(restoredData);
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [leadResult, setLeadResult] = useState(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const exitIntentFired = useRef(false);
  const [googleLoaded, setGoogleLoaded] = useState(!!window.google?.maps?.places);
  const [tcpaDisclosure, setTcpaDisclosure] = useState('');

  const goTo = useCallback((idx) => {
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
    setFieldErrors({});
    setValidatedFields({});
    setConsentError('');
  }, []);

  // Persist progress to sessionStorage
  useEffect(() => {
    if (!submitted && !processing) {
      saveProgress(currentStep, formData);
    }
  }, [currentStep, formData, submitted, processing]);

  // Browser back button interception — show exit modal instead of navigating away
  useEffect(() => {
    const handlePopState = () => {
      if (submitted || processing) return;
      // Re-push state so they stay on the page, then show modal
      window.history.pushState({ funnelStep: currentStep }, '');
      if (!exitIntentFired.current) {
        exitIntentFired.current = true;
        setShowExitIntent(true);
      }
    };

    // Push a state for the current step
    if (!submitted && !processing) {
      window.history.pushState({ funnelStep: currentStep }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep, submitted, processing]);

  // Exit intent detection — 60 seconds of inactivity on any step past step 1
  useEffect(() => {
    if (submitted || processing || currentStep === 0) return;

    let idleTimer = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (exitIntentFired.current) return;
      idleTimer = setTimeout(() => {
        if (!exitIntentFired.current) {
          exitIntentFired.current = true;
          setShowExitIntent(true);
        }
      }, 60000);
    };
    const idleEvents = ['touchstart', 'mousemove', 'scroll', 'keydown'];
    idleEvents.forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
    resetIdle(); // start the timer

    return () => {
      idleEvents.forEach(evt => document.removeEventListener(evt, resetIdle));
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [submitted, processing, currentStep]);

  // Initialize SecureRights / LeadiD form capture
  // LeadiD loads async via GTM — poll until it's available, then init
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 40; // ~20 seconds total

    const tryInit = () => {
      attempts++;
      if (window.LeadiD?.formcapture?.init) {
        try {
          window.LeadiD.formcapture.init();
          console.log('[SR] LeadiD formcapture initialized');
        } catch (e) {
          console.warn('[SR] LeadiD init error:', e);
        }
        return true;
      }
      return false;
    };

    // Try immediately
    if (!tryInit() && attempts < maxAttempts) {
      const interval = setInterval(() => {
        if (tryInit() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.warn('[SR] LeadiD not found after polling — GTM may not be loading it');
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []); // Run once on mount

  // Re-initialize SecureRights on step changes (form DOM changes)
  useEffect(() => {
    if (window.LeadiD?.formcapture?.init) {
      try { window.LeadiD.formcapture.init(); } catch { /* ignore */ }
    }
  }, [currentStep]);

  // Auto-focus first field on form steps
  useEffect(() => {
    if (STEPS[currentStep]?.type === 'form') {
      const timer = setTimeout(() => firstFieldRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Fetch LeadPoint TCPA disclosure on the final step
  useEffect(() => {
    const onLastStep = currentStep === STEPS.length - 1;
    if (!onLastStep || tcpaDisclosure) return;
    fetch('/api/disclosure')
      .then(r => r.json())
      .then(data => { if (data.html) setTcpaDisclosure(data.html); })
      .catch(() => {}); // non-critical
  }, [currentStep, tcpaDisclosure]);

  // Load Google Places API script (client-side key, restricted to domain)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || window.google?.maps?.places) {
      if (window.google?.maps?.places) setGoogleLoaded(true);
      return;
    }
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach Google Places Autocomplete to address input on the location step
  useEffect(() => {
    if (!googleLoaded || STEPS[currentStep]?.id !== 'zip') return;

    const input = document.getElementById('field-address');
    if (!input) return;

    // Prevent browser native autocomplete from competing with Google Places
    input.setAttribute('autocomplete', 'off');

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components'],
    });

    // Chrome sometimes resets autocomplete attr — force it off after a tick
    setTimeout(() => input.setAttribute('autocomplete', 'off'), 100);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      let streetNumber = '';
      let route = '';
      let zip = '';

      for (const component of place.address_components) {
        const type = component.types[0];
        if (type === 'street_number') streetNumber = component.long_name;
        else if (type === 'route') route = component.short_name;
        else if (type === 'postal_code') zip = component.long_name;
      }

      const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;

      setFormData(prev => ({
        ...prev,
        address: streetAddress,
        ...(zip ? { zip_code: zip } : {}),
      }));

      if (streetAddress) {
        setValidatedFields(prev => ({ ...prev, address: true }));
        setFieldErrors(prev => ({ ...prev, address: undefined }));
      }
      if (zip) {
        setValidatedFields(prev => ({ ...prev, zip_code: true }));
        setFieldErrors(prev => ({ ...prev, zip_code: undefined }));
      }
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [currentStep, googleLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Input masking + formatting
  const handleFieldChange = (name, value) => {
    let formatted = value;
    if (name === 'home_value' || name === 'mortgage_balance') {
      formatted = formatCurrency(value);
    } else if (name === 'phone') {
      formatted = formatPhone(value);
    } else if (name === 'current_rate') {
      formatted = formatRate(stripRate(value));
    } else if (name === 'zip_code') {
      formatted = value.replace(/\D/g, '').slice(0, 5);
    }

    setFormData(prev => ({ ...prev, [name]: formatted }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    if (validatedFields[name]) setValidatedFields(prev => ({ ...prev, [name]: false }));
    if (name === 'email') setEmailSuggestion('');

    // TODO: Re-engagement email — when the user enters their email on step 2 and then
    // abandons the funnel, trigger an automated follow-up sequence via your email service
    // (e.g. Mailchimp, SendGrid). Fire a POST to your backend here with `name` === 'email'
    // and `value` as the address captured, along with any formData already collected.
    // Example:
    //   if (name === 'email' && value.includes('@')) {
    //     fetch('/api/leads/partial', { method: 'POST', body: JSON.stringify({ email: value }) });
    //   }
  };

  // Validate on blur
  const handleFieldBlur = (name) => {
    const value = formData[name] || '';
    const validate = validators[name];
    if (!validate || !value.trim()) return; // Don't show errors on empty blur (wait for submit)
    const result = validate(value);
    if (result !== true) {
      setFieldErrors(prev => ({ ...prev, [name]: result }));
      setValidatedFields(prev => ({ ...prev, [name]: false }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
      setValidatedFields(prev => ({ ...prev, [name]: true }));
      // Check email typo only after passing basic validation
      if (name === 'email') {
        const typo = detectEmailTypo(value);
        setEmailSuggestion(typo || '');
      }
    }
  };

  const handleAcceptEmailSuggestion = () => {
    const parts = formData.email.trim().split('@');
    const domain = parts[1]?.toLowerCase();
    const corrected = EMAIL_DOMAIN_CORRECTIONS[domain];
    if (corrected) {
      setFormData(prev => ({ ...prev, email: `${parts[0]}@${corrected}` }));
      setEmailSuggestion('');
    }
  };

  const handleOptionSelect = (stepId, value) => {
    setFormData(prev => ({ ...prev, [stepId]: value }));
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
    }, 300);
  };

  const advanceStep = () => {
    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Shake the card
      const card = document.querySelector('.funnel-card');
      if (card) { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); }
      return;
    }
    setFieldErrors({});
    goTo(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double-submit

    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const card = document.querySelector('.funnel-card');
      if (card) { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); }
      return;
    }
    if (!consentAgreed) {
      setConsentError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setConsentError('');
    setSubmitting(true);

    // Gather third-party compliance tokens from DOM
    // TrustedForm and SecureRights scripts inject their own hidden inputs —
    // find the one with an actual value (skip any empty duplicates)
    const trustedFormCertUrl = Array.from(document.querySelectorAll('input[name="xxTrustedFormCertUrl"]'))
      .map(el => el.value).find(v => v) || '';

    // LeadiD/SecureRights may use "universal_leadid" or "SR_TOKEN" as the field name
    const srToken = Array.from(document.querySelectorAll('input[name="SR_TOKEN"], input[name="universal_leadid"], input[name="leadid_token"]'))
      .map(el => el.value).find(v => v) || '';

    console.log('[Compliance Tokens]', { trustedFormCertUrl, srToken });

    // Build payload (backend handles field mapping to LeadPoint names)
    const payload = {
      goal: formData['goal'],
      email: formData['email'],
      property_type: formData['property-type'],
      home_value: formData['home_value'],
      mortgage_balance: formData['mortgage_balance'],
      current_rate: formData['current_rate'],
      additional_cash: formData['additional_cash'],
      credit: formData['credit'],
      address: formData['address'],
      zip_code: formData['zip_code'],
      first_name: formData['first_name'],
      last_name: formData['last_name'],
      phone: formData['phone'],
      trustedFormCertUrl,
      srToken,
    };

    // Identify user with Chatbase
    identifyChatbaseUser(formData);

    // Clear saved progress
    clearProgress();

    // Show processing animation
    setAnimKey(k => k + 1);
    setProcessing(true);
    const submitStart = Date.now();

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setLeadResult(result);

      // Ensure processing animation shows for at least 5 seconds
      const elapsed = Date.now() - submitStart;
      if (elapsed < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
      }

      setProcessing(false);
      setSubmitted(true);
      setSubmitting(false);
      setAnimKey(k => k + 1);
    } catch (err) {
      console.error('Submission error:', err);

      const elapsed = Date.now() - submitStart;
      if (elapsed < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
      }

      setLeadResult({
        status: 'NETWORK_ERROR',
        message: 'We couldn\'t connect to our servers. Please check your connection and try again.',
        errors: [],
        buyers: [],
      });
      setProcessing(false);
      setSubmitted(true);
      setSubmitting(false);
      setAnimKey(k => k + 1);
    }
  };

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  // Enter key to advance on form steps
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Enter' && step?.type === 'form' && !submitted && !processing) {
        e.preventDefault();
        if (isLast) handleSubmit();
        else advanceStep();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }); // intentionally no deps — always uses latest closures

  return (
    <form className="funnel-page" onSubmit={e => e.preventDefault()} id="leadform">
      {/* Hidden inputs for TrustedForm and SecureRights (scripts inject values into these) */}
      <input type="hidden" name="xxTrustedFormCertUrl" />
      <input type="hidden" name="SR_TOKEN" />
      <input type="hidden" id="leadid_token" name="universal_leadid" />

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <ExitIntentModal
          onStay={() => setShowExitIntent(false)}
        />
      )}

      {/* Header */}
      <div className="funnel-header">
        <span className="logo funnel-logo-static">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          GetMyRefinance
        </span>
      </div>

      {/* Stepped Progress Bar */}
      {!submitted && !processing && (
        <SteppedProgress currentStep={currentStep} totalSteps={STEPS.length} />
      )}

      {/* Body */}
      <div className="funnel-body">
        <div className={`funnel-card${submitted || processing ? '' : ' step-active'}`} key={animKey}>
          {processing ? (
            <ProcessingScreen />
          ) : submitted ? (
            <ResultsScreen
              result={leadResult}
              formData={formData}
              onRetry={() => {
                setSubmitted(false);
                setLeadResult(null);
                setSubmitting(false);
                goTo(STEPS.length - 1);
              }}
            />
          ) : (
            <>
              <div className="funnel-step-label">{step.label}</div>
              <h2>{step.title}</h2>
              <p>{step.subtitle}</p>

              {/* Social proof on first step */}
              {step.id === 'goal' && <SocialProof />}

              {/* AI message on email step only */}
              {step.id === 'email-capture' && <AIMatchingMessage />}

              {step.type === 'options' ? (
                <OptionStep step={step} formData={formData} onSelect={handleOptionSelect} />
              ) : step.type === 'slider' ? (
                <CashOutStep formData={formData} onChange={handleFieldChange} />
              ) : (
                <FormStep
                  step={step}
                  formData={formData}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  errors={fieldErrors}
                  validated={validatedFields}
                  emailSuggestion={emailSuggestion}
                  onAcceptEmailSuggestion={handleAcceptEmailSuggestion}
                  firstFieldRef={firstFieldRef}
                />
              )}

              {/* Trust badges on final step */}
              {isLast && <TrustBadges />}

              {/* LeadPoint TCPA disclosure on final step */}
              {isLast && tcpaDisclosure && (
                <div id="srDisclosure" dangerouslySetInnerHTML={{ __html: tcpaDisclosure }} />
              )}

              {/* Consent on final step */}
              {step.hasConsent && (
                <ConsentBlock agreed={consentAgreed} onChange={(v) => { setConsentAgreed(v); setConsentError(''); }} error={consentError} />
              )}

              {/* Error summary for screen readers */}
              <div aria-live="polite" className="sr-only">
                {Object.values(fieldErrors).filter(Boolean).join('. ')}
              </div>

              <div className="funnel-nav">
                {currentStep > 0 ? (
                  <button className="funnel-back" onClick={() => goTo(currentStep - 1)}>
                    {'\u2190'} Back
                  </button>
                ) : <div />}

                {(step.type === 'form' || step.type === 'slider') && (
                  <div className="funnel-cta-wrap">
                    {isLast ? (
                      <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'See My Rates \u2192'}
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={advanceStep}>
                        Continue {'\u2192'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
