import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';


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
  let digits = raw.replace(/\D/g, '');
  // Strip leading country code 1
  if (digits.length > 10 && digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
    title: 'What is your refinance goal?',
    subtitle: 'This helps us match you with the right lenders.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ), label: 'Cash out refinance', value: 'cash-out' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
        </svg>
      ), label: 'Lower my monthly payment', value: 'lower-payment' },
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
    id: 'property-type',
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
      ), label: 'Mftr. Home / Mobile Home', value: 'manufactured' },
    ],
  },
  {
    id: 'home-value',
    title: 'Estimated home value?',
    subtitle: "Your best estimate is fine — we'll verify later.",
    type: 'slider-home-value',
  },
  {
    id: 'mortgage-balance',
    title: 'Current mortgage balance?',
    subtitle: "Don't forget to include 2nd mortgage balance.",
    type: 'slider-mortgage-balance',
  },
  {
    id: 'cash-out',
    title: 'How much cash out do you need?',
    subtitle: 'Many homeowners use cash-out for renovations, debt payoff, or a financial cushion.',
    type: 'slider',
  },
  {
    id: 'credit',
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
    id: 'va-status',
    title: 'Are you a veteran or active military?',
    subtitle: 'VA loans offer special benefits for eligible borrowers.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ), label: 'Yes', value: 'YES' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'No', value: 'NO' },
    ],
  },
  {
    id: 'fha-loan',
    title: 'Is your current loan an FHA loan?',
    subtitle: 'FHA loans have different refinance options.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'Yes', value: 'yes' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'No', value: 'no' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: "Not sure", value: 'not-sure' },
    ],
  },
  {
    id: 'income-proof',
    title: 'Can you provide proof of income?',
    subtitle: 'Lenders typically require documentation of your income.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'Yes', value: 'yes' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'No', value: 'no' },
    ],
  },
  {
    id: 'bankruptcy',
    title: 'Any bankruptcy or foreclosure in the last 3 years?',
    subtitle: 'This helps lenders determine your eligibility.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'Yes', value: 'yes' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'No', value: 'no' },
    ],
  },
  {
    id: 'mortgage-lates',
    title: 'Any late mortgage payments in the last 12 months?',
    subtitle: 'This will help us connect you with the best lenders.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'Yes', value: 'yes' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'No', value: 'no' },
    ],
  },
  {
    id: 'zip',
    title: 'Where is your property located?',
    subtitle: 'Rates vary by location — this helps us find local offers.',
    type: 'form',
    fields: [
      { name: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main St', autoComplete: 'off', enterKeyHint: 'next' },
      { name: 'address2', label: 'Apt / Unit #', type: 'text', placeholder: '', autoComplete: 'address-line2', enterKeyHint: 'next', optional: true, row: 'apt-zip' },
      { name: 'zip_code', label: 'ZIP Code', type: 'text', placeholder: '90210', maxLength: 5, autoComplete: 'postal-code', inputMode: 'numeric', enterKeyHint: 'done', row: 'apt-zip' },
    ],
  },
  {
    id: 'name',
    title: 'What is your name?',
    subtitle: 'So lenders know who to prepare your offer for.',
    type: 'form',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John', autoComplete: 'given-name', enterKeyHint: 'next' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Smith', autoComplete: 'family-name', enterKeyHint: 'done' },
    ],
  },
  {
    id: 'contact',
    title: 'How can lenders reach you?',
    subtitle: 'We\'ll send your personalized offers here.',
    type: 'form',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', autoComplete: 'email', inputMode: 'email', enterKeyHint: 'next' },
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', autoComplete: 'tel', inputMode: 'tel', enterKeyHint: 'done' },
    ],
  },
];

/* ============================================================
   Progress Bar
   ============================================================ */


const BREADCRUMB_SECTIONS = [
  { label: 'Property Info', endStep: 4 },
  { label: 'Your Profile', endStep: 10 },
  { label: 'Contact Info', endStep: 13 },
];

function SteppedProgress({ currentStep, totalSteps }) {
  const fillPercent = ((currentStep + 1) / totalSteps) * 100;
  const currentSection = BREADCRUMB_SECTIONS.findIndex(s => currentStep <= s.endStep);

  return (
    <div className="heloc-progress-wrap">
      <div className="heloc-breadcrumbs">
        {BREADCRUMB_SECTIONS.map((section, i) => (
          <span key={i} className={`heloc-breadcrumb${i === currentSection ? ' active' : ''}${i < currentSection ? ' done' : ''}`}>
            {i < currentSection ? '\u2713 ' : ''}{section.label}
          </span>
        ))}
      </div>
      <div className="funnel-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
        <div className="simple-progress-track">
          <div className="simple-progress-fill heloc-progress-fill" style={{ width: `${fillPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Option Step (accessible)
   ============================================================ */

function OptionStep({ step, formData, onSelect }) {
  // Keyboard number shortcuts (1-9) to select options
  useEffect(() => {
    const handler = (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= step.options.length) {
        onSelect(step.id, step.options[num - 1].value);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [step.id, step.options, onSelect]);

  const handleKeyDown = (e, value) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(step.id, value);
    }
  };

  return (
    <div className="funnel-options" role="radiogroup" aria-label={step.title}>
      {step.options.map((opt) => {
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
   Slider Steps (Home Value & Mortgage Balance)
   ============================================================ */

function SliderStep({ fieldName, formData, onChange, min, max, step, label, defaultValue }) {
  useEffect(() => {
    if (defaultValue && !formData[fieldName]) {
      onChange(fieldName, '$' + defaultValue.toLocaleString('en-US'));
    }
  }, []);

  const rawValue = parseCurrencyToNumber(formData[fieldName] || (defaultValue ? '$' + defaultValue : '$0'));
  const displayValue = rawValue.toLocaleString('en-US');

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    onChange(fieldName, val === 0 ? '$0' : '$' + val.toLocaleString('en-US'));
  };

  return (
    <div className="cashout-step">
      <div className="cashout-amount-display">
        <span className="cashout-dollar">${displayValue}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={rawValue}
        onChange={handleSlider}
        className="cashout-slider"
        aria-label={label}
      />

      <div className="cashout-range-labels">
        <span>${min.toLocaleString('en-US')}</span>
        <span>${max.toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

function CashOutStep({ formData, onChange }) {
  const homeValue = parseCurrencyToNumber(formData['home_value'] || '$0');
  const mortgageBalance = parseCurrencyToNumber(formData['mortgage_balance'] || '$0');
  const maxCashOut = homeValue || 100000;

  // Default: 80% of home value minus mortgage balance, or $30k
  const defaultCashOut = homeValue > 0
    ? Math.max(0, Math.round((homeValue * 0.8 - mortgageBalance) / 5000) * 5000)
    : 30000;

  useEffect(() => {
    if (!formData['additional_cash']) {
      const val = Math.min(defaultCashOut, maxCashOut);
      onChange('additional_cash', val === 0 ? '$0' : '$' + val.toLocaleString('en-US'));
    }
  }, []);

  const rawValue = Math.min(parseCurrencyToNumber(formData['additional_cash'] || '$' + defaultCashOut), maxCashOut);
  const displayValue = rawValue.toLocaleString('en-US');

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    onChange('additional_cash', val === 0 ? '$0' : '$' + val.toLocaleString('en-US'));
  };

  return (
    <div className="cashout-step">
      <div className="cashout-amount-display">
        <span className="cashout-dollar">${displayValue}</span>
      </div>

      <input
        type="range"
        min={0}
        max={maxCashOut || 100000}
        step={5000}
        value={rawValue}
        onChange={handleSlider}
        className="cashout-slider"
        aria-label="Cash out amount"
      />

      <div className="cashout-range-labels">
        <span>$0</span>
        <span>${(maxCashOut || 100000).toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Form Step (accessible, masked inputs, blur validation)
   ============================================================ */

function FieldInput({ field, idx, formData, onChange, onBlur, errors, validated, emailSuggestion, onAcceptEmailSuggestion, firstFieldRef }) {
  const hasError = !!errors[field.name];
  const isValid = !hasError && !!validated[field.name];
  return (
    <div className={`form-group${hasError ? ' has-error' : ''}${isValid ? ' has-valid' : ''}`} style={field.row ? { flex: field.name === 'zip_code' ? '0 0 40%' : '1 1 55%' } : undefined}>
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
}

function FormStep({ step, formData, onChange, onBlur, errors = {}, validated = {}, emailSuggestion, onAcceptEmailSuggestion, firstFieldRef }) {
  // Group fields by row
  const elements = [];
  let i = 0;
  while (i < step.fields.length) {
    const field = step.fields[i];
    if (field.row) {
      const rowFields = [];
      const rowName = field.row;
      while (i < step.fields.length && step.fields[i].row === rowName) {
        rowFields.push(step.fields[i]);
        i++;
      }
      elements.push(
        <div key={`row-${rowName}`} style={{ display: 'flex', gap: 12 }}>
          {rowFields.map((f, ri) => (
            <FieldInput key={f.name} field={f} idx={-1} formData={formData} onChange={onChange} onBlur={onBlur} errors={errors} validated={validated} emailSuggestion={emailSuggestion} onAcceptEmailSuggestion={onAcceptEmailSuggestion} firstFieldRef={undefined} />
          ))}
        </div>
      );
    } else {
      elements.push(
        <FieldInput key={field.name} field={field} idx={i} formData={formData} onChange={onChange} onBlur={onBlur} errors={errors} validated={validated} emailSuggestion={emailSuggestion} onAcceptEmailSuggestion={onAcceptEmailSuggestion} firstFieldRef={i === 0 ? firstFieldRef : undefined} />
      );
      i++;
    }
  }
  return <>{elements}</>;
}


/* ============================================================
   Social Proof
   ============================================================ */

const SOCIAL_PROOF_MESSAGES = {
  'goal': 'stats',
  'property-type': '89% of applicants get matched with 3+ lenders',
  'credit': 'All credit scores welcome — we have options for everyone',
  'va-status': 'Over 500 veterans matched this month',
  'zip': null,
  'contact': null,
};

function SocialProof({ stepId }) {
  const message = SOCIAL_PROOF_MESSAGES[stepId];
  if (!message) return null;

  if (message === 'stats') {
    return (
      <div className="funnel-stats" aria-label="Our track record">
        <div className="funnel-stat">
          <strong>$2.1B+</strong>
          <span>Loans Matched</span>
        </div>
        <div className="funnel-stat-divider" aria-hidden="true" />
        <div className="funnel-stat">
          <strong>4.8★</strong>
          <span>Avg Rating</span>
        </div>
        <div className="funnel-stat-divider" aria-hidden="true" />
        <div className="funnel-stat">
          <strong>50K+</strong>
          <span>Happy Homeowners</span>
        </div>
      </div>
    );
  }

  return (
    <div className="social-proof" aria-label="Social proof">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
      <span>{message}</span>
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
        <span>Free Quote won't affect your credit</span>
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
        Finding Your Best Match
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
   Partner Offers (Gold Status Link-Out)
   ============================================================ */

const PARTNER_OFFERS = [
  {
    category: 'Debt Relief',
    title: 'National Debt Relief',
    description: 'Resolve your debt for a fraction of what you owe. Free consultation with no obligation.',
    cta: 'Get Free Quote',
    url: 'https://www.nationaldebtrelief.com',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    badge: 'Popular',
  },
  {
    category: 'Home Insurance',
    title: 'Compare Home Insurance',
    description: 'Save up to 40% on homeowners insurance. Compare rates from top providers in minutes.',
    cta: 'Compare Rates',
    url: 'https://www.policygenius.com/homeowners-insurance/',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    badge: null,
  },
  {
    category: 'Credit Monitoring',
    title: 'Free Credit Score',
    description: 'Monitor your credit score and get personalized tips to improve it. 100% free.',
    cta: 'Check Your Score',
    url: 'https://www.creditkarma.com',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    badge: 'Free',
  },
  {
    category: 'Personal Loans',
    title: 'Personal Loan Offers',
    description: 'Compare personal loan rates from multiple lenders. Rates as low as 5.99% APR.',
    cta: 'See Offers',
    url: 'https://www.sofi.com/personal-loans/',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    badge: null,
  },
  {
    category: 'Solar Savings',
    title: 'Home Solar Estimate',
    description: 'See how much you could save with solar panels. Free estimate based on your home.',
    cta: 'Get Estimate',
    url: 'https://www.energysage.com',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
    badge: null,
  },
];

/* ============================================================
   Results Screen (Gold Status)
   ============================================================ */

function ResultsScreen({ result, formData, onRetry }) {
  if (!result) return null;

  const { status, message, errors } = result;
  const firstName = formData.first_name || 'there';
  const isSuccess = status === 'OK';

  // Error / failure states
  if (status === 'INVALID' || status === 'INTEGRATION_ERROR' || status === 'SERVER_ERROR' || status === 'NETWORK_ERROR' || status === 'CLIENT_ERROR') {
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

  // Gold Status page — shown for all successful submissions
  return (
    <div style={{ padding: '10px 0' }}>
      {/* Gold Status Header */}
      <div style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 50%, #D4AF37 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '24px 20px',
        marginBottom: 24,
        color: '#1a1a2e',
      }}>
        <div style={{
          width: 56, height: 56, margin: '0 auto 12px',
          background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#1a1a2e" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6, color: '#1a1a2e' }}>
          Congrats, {firstName}!
        </h2>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 4, color: '#1a1a2e' }}>
          You've Unlocked Gold Status
        </p>
        <p style={{ fontSize: '0.85rem', opacity: 0.85, color: '#1a1a2e' }}>
          {isSuccess
            ? 'Your refinance request has been submitted. Lenders will reach out soon.'
            : status === 'UNMATCHED' || status === 'PENDING_MATCH'
              ? 'No matches right now, but you have access to exclusive partner offers below.'
              : 'Your request is being processed. In the meantime, explore exclusive partner offers.'}
        </p>
      </div>

      {/* What happens next */}
      {isSuccess && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>What happens next:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Lenders will contact you within minutes', 'Compare their personalized rate offers', 'Choose the best option \u2014 zero obligation'].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.9rem' }}>{'\u2713'}</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--color-text-light)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partner Offers */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          textAlign: 'center', fontSize: '0.92rem', fontWeight: 700,
          color: 'var(--color-text)', marginBottom: 4,
        }}>
          Exclusive Gold Status Partner Offers
        </p>
        <p style={{
          textAlign: 'center', fontSize: '0.8rem',
          color: 'var(--color-text-muted)', marginBottom: 16,
        }}>
          Handpicked services to help you save more as a homeowner
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PARTNER_OFFERS.map((offer, i) => (
            <a
              key={i}
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: '#fff', textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {offer.badge && (
                <span style={{
                  position: 'absolute', top: -8, right: 12,
                  background: offer.badge === 'Free' ? 'var(--color-success)' : 'var(--color-secondary)',
                  color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {offer.badge}
                </span>
              )}
              <div style={{ flexShrink: 0, marginTop: 2 }}>{offer.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {offer.category}
                </p>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  {offer.title}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: 8, lineHeight: 1.4 }}>
                  {offer.description}
                </p>
                <span style={{
                  display: 'inline-block', fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--color-primary)', padding: '6px 16px',
                  border: '1.5px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {offer.cta} {'\u2192'}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <p style={{
        textAlign: 'center', fontSize: '0.72rem',
        color: 'var(--color-text-muted)', marginBottom: 16,
        fontStyle: 'italic',
      }}>
        Advertiser Disclosure: We may receive compensation when you click on partner links.
      </p>

      <div style={{ textAlign: 'center' }}>
        <Link to="/home" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
          Return to Homepage
        </Link>
      </div>
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
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) return 'Please enter a valid email address.';
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
  const [slideDir, setSlideDir] = useState('forward');
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [leadResult, setLeadResult] = useState(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const exitIntentFired = useRef(false);
  const [googleLoaded, setGoogleLoaded] = useState(!!window.google?.maps?.places);

  // ── Funnel Analytics ──
  const analyticsRef = useRef({
    sessionId: `refi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    funnelStart: Date.now(),
    stepStart: Date.now(),
    stepsCompleted: 0,
  });

  const logFunnelEvent = useCallback((event, stepId, stepIndex) => {
    const a = analyticsRef.current;
    const now = Date.now();
    const payload = {
      event,
      funnel: 'refi',
      sessionId: a.sessionId,
      step: stepId,
      stepIndex,
      totalSteps: STEPS.length,
      timeOnStep: now - a.stepStart,
      totalTime: now - a.funnelStart,
      stepsCompleted: a.stepsCompleted,
      userAgent: navigator.userAgent,
    };
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/log-funnel', JSON.stringify(payload));
      } else {
        fetch('/api/log-funnel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true });
      }
    } catch { /* never block user */ }
  }, []);

  // Log drop-off on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (!submitted && !processing) {
        logFunnelEvent('drop_off', STEPS[currentStep]?.id, currentStep);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [currentStep, submitted, processing, logFunnelEvent]);

  const goTo = useCallback((idx) => {
    // Log step completion when advancing forward
    if (idx > currentStep) {
      analyticsRef.current.stepsCompleted = Math.max(analyticsRef.current.stepsCompleted, currentStep + 1);
      logFunnelEvent('step_complete', STEPS[currentStep]?.id, currentStep);
    }
    analyticsRef.current.stepStart = Date.now();
    setSlideDir(idx > currentStep ? 'forward' : 'back');
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
    setFieldErrors({});
    setValidatedFields({});
  }, [currentStep, logFunnelEvent]);

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
      let city = '';
      let state = '';

      for (const component of place.address_components) {
        const type = component.types[0];
        if (type === 'street_number') streetNumber = component.long_name;
        else if (type === 'route') route = component.short_name;
        else if (type === 'postal_code') zip = component.long_name;
        else if (type === 'locality') city = component.long_name;
        else if (type === 'administrative_area_level_1') state = component.short_name;
      }

      const streetBase = streetNumber ? `${streetNumber} ${route}` : route;
      const streetAddress = [streetBase, city, state].filter(Boolean).join(', ');

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
      additional_cash: formData['additional_cash'],
      credit: formData['credit'],
      va_status: formData['va-status'] || 'NO',
      fha_loan: formData['fha-loan'] || 'no',
      income_proof: formData['income-proof'] || '',
      bankruptcy: formData['bankruptcy'] || '',
      mortgage_lates: formData['mortgage-lates'] || '',
      address: formData['address2'] ? `${formData['address']} ${formData['address2']}` : formData['address'],
      zip_code: formData['zip_code'],
      first_name: formData['first_name'],
      last_name: formData['last_name'],
      phone: formData['phone'],
      trustedFormCertUrl,
      srToken,
    };

    // Clear saved progress
    clearProgress();

    // Show processing animation
    setAnimKey(k => k + 1);
    setProcessing(true);
    const submitStart = Date.now();

    try {
      let result;
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        // API not available (local dev) — use mock response
        console.warn('API not available, using mock response for local dev');
        result = {
          status: 'OK',
          leadId: 'DEV-' + Date.now(),
          buyers: [],
          errors: [],
          message: '',
        };
      }
      setLeadResult(result);

      // Ensure processing animation shows for at least 5 seconds
      const elapsed = Date.now() - submitStart;
      if (elapsed < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
      }

      analyticsRef.current.stepsCompleted = STEPS.length;
      logFunnelEvent('funnel_complete', 'submitted', STEPS.length - 1);
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
      <div className="funnel-header">
        <Link to="/" className="logo funnel-logo-static">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          GetMyRefinance
        </Link>
      </div>
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

      {/* Stepped Progress Bar */}
      {!submitted && !processing && (
        <SteppedProgress currentStep={currentStep} totalSteps={STEPS.length} />
      )}

      {/* Body */}
      <div className="funnel-body">
        <div className={`funnel-card${submitted || processing ? '' : ` slide-${slideDir}`}`} key={animKey}>
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
              <h2>{step.title}</h2>
              <p>{step.subtitle}</p>

              {/* Social proof on key steps */}
              <SocialProof stepId={step.id} />


              {step.type === 'slider-home-value' ? (
                <SliderStep fieldName="home_value" formData={formData} onChange={handleFieldChange} min={50000} max={2000000} step={10000} label="Estimated home value" defaultValue={350000} />
              ) : step.type === 'slider-mortgage-balance' ? (
                <SliderStep fieldName="mortgage_balance" formData={formData} onChange={handleFieldChange} min={10000} max={parseCurrencyToNumber(formData['home_value'] || '$350000') || 2000000} step={5000} label="Current mortgage balance" defaultValue={Math.round((parseCurrencyToNumber(formData['home_value'] || '$350000') || 350000) * 0.7 / 5000) * 5000} />
              ) : step.type === 'options' ? (
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

              {/* Lender logos + Trust badges on final step */}
              {/* LenderLogos removed */}
              {isLast && <TrustBadges />}

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

                {(step.type === 'form' || step.type === 'slider' || step.type === 'slider-home-value' || step.type === 'slider-mortgage-balance') && (
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

              {/* LeadPoint TCPA disclosure on final step */}
              {isLast && (
                <div className="tcpa-disclosure">
                  By clicking the button above, you agree to: (1) our{' '}
                  <Link to="/terms-of-service" target="_blank">TERMS OF USE</Link>, which include a Class Waiver
                  and Mandatory Arbitration Agreement, (2) our{' '}
                  <Link to="/privacy-policy" target="_blank">PRIVACY POLICY</Link>, and (3) receive notices and
                  other COMMUNICATIONS ELECTRONICALLY. By clicking the button above, you: (a) provide your express
                  written consent and binding signature under the ESIGN Act for Evolute, Inc., a Delaware corporation,
                  to share your information with up to four (4) of its PREMIER PARTNERS and/or third parties acting
                  on their behalf to contact you via telephone, mobile device (including SMS and MMS) and/or email,
                  including but not limited to texts or calls made using an automated telephone dialing system,
                  AI-generated voice and text messages, or pre-recorded or artificial voice messages, regarding
                  financial services or other offers related to homeownership; (b) understand that your consent is
                  valid even if your telephone number is currently listed on any state, federal, local or corporate
                  Do Not Call list; (c) represent that you are the wireless subscriber or customary user of the
                  wireless number(s) provided with authority to consent; (d) understand your consent is not required
                  in order to obtain any good or service; (e) represent that you have received and reviewed the
                  MORTGAGE BROKER DISCLOSURES for your state; and (f) provide your consent under the Fair Credit
                  Reporting Act for Evolute, Inc. and/or its PREMIER PARTNERS to obtain information from your
                  personal credit profile to prequalify you for credit options and connect you with an appropriate
                  partner. You may choose to speak with an individual service provider by dialing 844-326-3442.
                  Evolute, Inc. NMLS 2781584.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    <div style={{ borderTop: '1px solid #d5d4d4', padding: '12px 24px 20px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#848282', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>Terms of Use</Link>
        <span style={{ color: '#d5d4d4' }}>|</span>
        <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#848282', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>Privacy Policy</Link>
      </div>
      <p style={{ fontSize: '0.7rem', color: '#848282', lineHeight: 1.7, textAlign: 'center' }}>
        By using this site, you agree to: (1) our{' '}
        <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: '#848282', textDecoration: 'underline' }}>TERMS OF USE</Link>, which include a Class Waiver
        and Mandatory Arbitration Agreement, (2) our{' '}
        <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#848282', textDecoration: 'underline' }}>PRIVACY POLICY</Link>, and (3) receive notices and
        other COMMUNICATIONS ELECTRONICALLY. By submitting your information, you: (a) provide your express
        written consent and binding signature under the ESIGN Act for Evolute, Inc., a Delaware corporation,
        to share your information with up to four (4) of its PREMIER PARTNERS and/or third parties acting
        on their behalf to contact you via telephone, mobile device (including SMS and MMS) and/or email,
        including but not limited to texts or calls made using an automated telephone dialing system,
        AI-generated voice and text messages, or pre-recorded or artificial voice messages, regarding
        financial services or other offers related to homeownership; (b) understand that your consent is
        valid even if your telephone number is currently listed on any state, federal, local or corporate
        Do Not Call list; (c) represent that you are the wireless subscriber or customary user of the
        wireless number(s) provided with authority to consent; (d) understand your consent is not required
        in order to obtain any good or service; (e) represent that you have received and reviewed the
        MORTGAGE BROKER DISCLOSURES for your state; and (f) provide your consent under the Fair Credit
        Reporting Act for Evolute, Inc. and/or its PREMIER PARTNERS to obtain information from your
        personal credit profile to prequalify you for credit options and connect you with an appropriate
        partner. You may choose to speak with an individual service provider by dialing 844-326-3442.
        Evolute, Inc. NMLS 2781584.
      </p>
      <p style={{ fontSize: '0.7rem', color: '#848282', lineHeight: 1.7, textAlign: 'center', marginTop: 10 }}>
        GetMyRefinance is not acting as a lender or broker. The information provided is not an application for a mortgage loan. If contacted by a lender in our network, your quoted rate may vary depending on your property location, credit score, loan-to-value ratio, and other factors. Not all loan products are available in all states. Equal Housing Opportunity.
      </p>
    </div>
    </form>
  );
}
