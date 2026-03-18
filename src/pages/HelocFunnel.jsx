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
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatDob(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}


/* ============================================================
   Common Email Typos
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
   HELOC Steps Configuration
   ============================================================ */

const ALL_STEPS = [
  {
    id: 'heloc-amount',
    title: 'How much do you want to borrow with a HELOC?',
    subtitle: 'Loan requests of $10,000 or more typically see higher approval rates.',
    type: 'slider-heloc-amount',
  },
  {
    id: 'property-type',
    title: "What type of property is your home?",
    subtitle: 'This helps us match you with the right HELOC offers.',
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
      ), label: 'Townhome', value: 'condo' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      ), label: 'Condominium', value: 'condominium' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 11 12 2 2 11"/><path d="M6 11v9a1 1 0 001 1h3v-4h4v4h3a1 1 0 001-1v-9"/><line x1="12" y1="2" x2="12" y2="2"/>
          <polyline points="18 8 22 11"/>
        </svg>
      ), label: 'Multi-Family Home', value: 'multi-family' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="12" rx="1"/><polyline points="2 14 22 14"/><line x1="6" y1="8" x2="6" y2="4"/><line x1="18" y1="8" x2="18" y2="4"/>
        </svg>
      ), label: 'Manufactured / Mobile Home', value: 'manufactured' },
    ],
  },
  {
    id: 'property-use',
    title: 'How do you use this property?',
    subtitle: 'Property usage affects your HELOC terms and rates.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ), label: 'Primary Home', value: 'primary' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
      ), label: 'Secondary Home', value: 'secondary' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      ), label: 'Rental Property', value: 'rental' },
    ],
  },
  {
    id: 'heloc-purpose',
    title: 'What is this HELOC for?',
    subtitle: "This helps lenders tailor the best offer for your needs.",
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ), label: 'Home Renovation', value: 'renovation' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ), label: 'Debt Consolidation', value: 'consolidate' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ), label: 'Investment Purposes', value: 'investment' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ), label: 'Cash for Expenses', value: 'cash' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'annual-income',
    title: "What's your annual pre-tax income?",
    subtitle: 'Include all income sources — wages, retirement, investments.',
    type: 'slider-income',
  },
  {
    id: 'home-value',
    title: "What's your home's estimated value?",
    subtitle: "Your best estimate is fine — we'll verify later.",
    type: 'slider-home-value',
  },
  {
    id: 'existing-mortgages',
    title: 'Do you have any existing mortgages on your home?',
    subtitle: "This affects how much equity you can access.",
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: "No, it's paid off", value: 'none' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ), label: 'One Mortgage', value: 'one' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="18" height="12" rx="2"/><rect x="5" y="8" width="18" height="12" rx="2"/>
        </svg>
      ), label: 'Two Mortgages', value: 'two' },
    ],
  },
  {
    id: 'mortgage-balance',
    title: "What's the balance on your first mortgage?",
    subtitle: "Your best estimate helps us calculate your available equity.",
    type: 'slider-mortgage-balance',
    conditional: true, // Only shown if existing-mortgages !== 'none'
  },
  {
    id: 'mortgage-balance-2',
    title: "What's the balance on your second mortgage?",
    subtitle: "Include any second mortgage, HELOC, or home equity loan balance.",
    type: 'slider-mortgage-balance-2',
    conditional: true, // Only shown if existing-mortgages === 'two'
  },
  {
    id: 'credit',
    title: "What's your credit score?",
    subtitle: "This won't impact your credit score. We only ask to match you with your best-fit offers.",
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: '720+', value: 'excellent' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ), label: '680\u2013719', value: 'good' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: '640\u2013679', value: 'fair' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: '639 or below', value: 'poor' },
    ],
  },
  {
    id: 'va-status',
    title: 'Are you or your spouse a U.S. veteran?',
    subtitle: "Veterans may qualify for special HELOC rates and benefits.",
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
    id: 'bankruptcy',
    title: 'Any bankruptcies or foreclosures in the last 7 years?',
    subtitle: "This will not impact your credit score. We only ask to refine your matches.",
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ), label: 'No', value: 'no' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ), label: 'Bankruptcy', value: 'bankruptcy' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><line x1="9" y1="13" x2="15" y2="13"/>
        </svg>
      ), label: 'Foreclosure', value: 'foreclosure' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Both', value: 'both' },
    ],
  },
  {
    id: 'employment-status',
    title: "What's your employment status?",
    subtitle: 'This helps lenders determine your eligibility.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      ), label: 'Employed', value: '7' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ), label: 'Self-Employed', value: '3' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'Not Employed', value: '5' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Other', value: '6' },
    ],
  },
  {
    id: 'own-home',
    title: 'Do you currently own or rent?',
    subtitle: 'This helps us verify your homeownership status.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ), label: 'Homeowner', value: 'Homeowner' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      ), label: 'Renter', value: 'Renter' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Other', value: 'Other' },
    ],
  },
  {
    id: 'time-at-residence',
    title: 'How long have you lived at your current address?',
    subtitle: 'Lenders consider residency length when evaluating applications.',
    type: 'options',
    options: [
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), label: 'Less than 1 year', value: 'Less than 1 year.' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), label: '1 to 2 years', value: '1 to 2 years' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ), label: '3+ years', value: 'More 3 years' },
    ],
  },
  {
    id: 'dob',
    title: "What's your date of birth?",
    subtitle: 'Applicants must be 18 or older. This is required by lenders.',
    type: 'form',
    fields: [
      { name: 'dob', label: 'Date of Birth', type: 'text', placeholder: 'MM/DD/YYYY', maxLength: 10, autoComplete: 'bday', inputMode: 'numeric', enterKeyHint: 'done' },
    ],
  },
  {
    id: 'zip',
    title: "What's your property address?",
    subtitle: 'Knowing your property location helps us find local HELOC offers.',
    type: 'form',
    fields: [
      { name: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main St', autoComplete: 'off', enterKeyHint: 'next' },
      { name: 'zip_code', label: 'ZIP Code', type: 'text', placeholder: '90210', maxLength: 5, autoComplete: 'postal-code', inputMode: 'numeric', enterKeyHint: 'done' },
    ],
  },
  {
    id: 'contact',
    title: 'Final step before your HELOC offers!',
    subtitle: "We'll send your personalized HELOC offers here.",
    type: 'form',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John', autoComplete: 'given-name', enterKeyHint: 'next' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Smith', autoComplete: 'family-name', enterKeyHint: 'next' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', autoComplete: 'email', inputMode: 'email', enterKeyHint: 'next' },
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', autoComplete: 'tel', inputMode: 'tel', enterKeyHint: 'done' },
    ],
  },
];

/* ============================================================
   Breadcrumb Progress
   ============================================================ */

const BREADCRUMB_SECTIONS = [
  { label: 'Property Info', endStep: 3 },
  { label: 'Financial Info', endStep: 9 },
  { label: 'About You', endStep: 14 },
  { label: 'Finalize', endStep: 17 },
];

function HelocProgress({ currentStep, totalSteps }) {
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
   Option Step
   ============================================================ */

function OptionStep({ step, formData, onSelect }) {
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
   Slider Steps
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
        <span>${max.toLocaleString('en-US')}+</span>
      </div>
    </div>
  );
}

/* ============================================================
   Quick Amount Buttons (HELOC amount step)
   ============================================================ */

function HelocAmountStep({ formData, onChange }) {
  const defaultAmount = 25000;

  useEffect(() => {
    if (!formData['heloc_amount']) {
      onChange('heloc_amount', '$' + defaultAmount.toLocaleString('en-US'));
    }
  }, []);

  const rawValue = parseCurrencyToNumber(formData['heloc_amount'] || '$' + defaultAmount);
  const displayValue = rawValue.toLocaleString('en-US');

  const quickAmounts = [10000, 15000, 25000, 50000, 75000, 100000, 150000, 200000];

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    onChange('heloc_amount', val === 0 ? '$0' : '$' + val.toLocaleString('en-US'));
  };

  return (
    <div className="cashout-step">
      <div className="cashout-amount-display">
        <span className="cashout-dollar">${displayValue}</span>
      </div>

      <input
        type="range"
        min={5000}
        max={500000}
        step={5000}
        value={rawValue}
        onChange={handleSlider}
        className="cashout-slider"
        aria-label="HELOC amount"
      />

      <div className="cashout-range-labels">
        <span>$5,000</span>
        <span>$500,000</span>
      </div>

      <div className="heloc-quick-amounts">
        {quickAmounts.map(amt => (
          <button
            key={amt}
            type="button"
            className={`heloc-quick-btn${rawValue === amt ? ' active' : ''}`}
            onClick={() => onChange('heloc_amount', '$' + amt.toLocaleString('en-US'))}
          >
            ${amt >= 1000 ? (amt / 1000) + 'K' : amt.toLocaleString('en-US')}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Form Step
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
   Social Proof
   ============================================================ */

const SOCIAL_PROOF_MESSAGES = {
  'heloc-amount': 'stats',
  'property-type': '92% of HELOC applicants get matched with top lenders',
  'credit': 'All credit scores welcome \u2014 we have HELOC options for everyone',
  'va-status': 'Over 300 veterans matched with HELOC offers this month',
  'employment-status': 'All employment types welcome',
  'own-home': null,
  'time-at-residence': null,
  'dob': 'Your information is protected with 256-bit encryption',
  'zip': null,
  'contact': 'Your info is protected with 256-bit encryption',
};

function SocialProof({ stepId }) {
  const message = SOCIAL_PROOF_MESSAGES[stepId];
  if (!message) return null;

  if (message === 'stats') {
    return (
      <div className="funnel-stats" aria-label="Our track record">
        <div className="funnel-stat">
          <strong>$850M+</strong>
          <span>HELOCs Matched</span>
        </div>
        <div className="funnel-stat-divider" aria-hidden="true" />
        <div className="funnel-stat">
          <strong>4.9\u2605</strong>
          <span>Avg Rating</span>
        </div>
        <div className="funnel-stat-divider" aria-hidden="true" />
        <div className="funnel-stat">
          <strong>25K+</strong>
          <span>Homeowners Served</span>
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

function LenderLogos() {
  return (
    <div className="lender-logos">
      <span className="lender-logos-label">Trusted by</span>
      <span className="lender-logo-item">Figure</span>
      <span className="lender-logo-item">Spring EQ</span>
      <span className="lender-logo-item">Bethpage FCU</span>
      <span className="lender-logo-item">+ more</span>
    </div>
  );
}

/* ============================================================
   Trust Badges
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
   Equity Estimate
   ============================================================ */

function EquityEstimate({ formData }) {
  const homeValue = parseCurrencyToNumber(formData['home_value'] || '$0');
  const mortgageBalance = parseCurrencyToNumber(formData['mortgage_balance'] || '$0');
  const hasMortgage = formData['existing-mortgages'] && formData['existing-mortgages'] !== 'none';

  if (homeValue <= 0) return null;

  const equity = hasMortgage ? Math.max(0, homeValue - mortgageBalance) : homeValue;
  const helocAmount = parseCurrencyToNumber(formData['heloc_amount'] || '$0');

  return (
    <div className="cashout-estimate">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>
        Estimated equity: <strong>${equity.toLocaleString('en-US')}</strong>
        {helocAmount > 0 && equity > 0 && (
          <> &mdash; {helocAmount <= equity * 0.85 ? 'You likely qualify!' : 'May require review'}</>
        )}
      </span>
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
    { text: 'Analyzing your home equity...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
    { text: 'Searching HELOC lender programs...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )},
    { text: 'Comparing HELOC rates & terms...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    )},
    { text: 'Finding your best HELOC match...', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { text: 'Preparing your HELOC offers...', icon: (
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
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }} role="status" aria-live="polite">
      <div style={{ marginBottom: 32 }}>
        <div className="processing-spinner">
          <span style={{ animation: 'none' }}>{phases[phase].icon}</span>
        </div>
      </div>

      <h2 style={{ marginBottom: 8, fontSize: '1.4rem', color: 'var(--color-primary)' }}>
        Finding Your Best HELOC Offers
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
   Gold Status Partner Offers
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
   Results Screen
   ============================================================ */

function ResultsScreen({ result, formData, onRetry }) {
  if (!result) return null;

  const { status, message, errors } = result;
  const firstName = formData.first_name || 'there';
  const isSuccess = status === 'OK';

  // Error / failure states
  if (status === 'INVALID' || status === 'SERVER_ERROR' || status === 'NETWORK_ERROR' || status === 'UNKNOWN') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 style={{ marginBottom: 12 }}>Something Went Wrong</h2>
        <p style={{ marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          {message || 'We encountered an error processing your HELOC request. Please try again.'}
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

  // Gold Status page — shown for all successful submissions (OK, UNMATCHED, DUPLICATE, CONFIRMATION_NEEDED)
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
            ? 'Your HELOC request has been submitted. Lenders will reach out soon.'
            : status === 'UNMATCHED'
              ? 'No HELOC matches right now, but you have access to exclusive partner offers below.'
              : 'Your request is being processed. In the meantime, explore exclusive partner offers.'}
        </p>
      </div>

      {/* What happens next */}
      {isSuccess && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>What happens next:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['HELOC lenders will contact you shortly', 'Compare their offers & terms', 'Choose the best option \u2014 zero obligation'].map((text, i) => (
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
        <p>You're just steps away from seeing your personalized HELOC offers. Don't miss out on accessing your home equity!</p>
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
  if (/^(.)\1+$/.test(s)) return true;
  if (/^(.{2})\1{2,}$/.test(s)) return true;
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
  dob: v => {
    if (!v.trim()) return 'Please enter your date of birth.';
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v.trim())) return 'Please use MM/DD/YYYY format.';
    const [mm, dd, yyyy] = v.trim().split('/').map(Number);
    if (mm < 1 || mm > 12) return 'Invalid month.';
    if (dd < 1 || dd > 31) return 'Invalid day.';
    if (yyyy < 1900 || yyyy > new Date().getFullYear()) return 'Invalid year.';
    const birthDate = new Date(yyyy, mm - 1, dd);
    const age = (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) return 'You must be at least 18 years old.';
    if (age > 120) return 'Please enter a valid date of birth.';
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

const STORAGE_KEY = 'gmr_heloc_progress';

function saveProgress(step, formData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData, ts: Date.now() }));
  } catch { /* quota exceeded */ }
}

function loadProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
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
   Main HELOC Funnel Component
   ============================================================ */

export default function HelocFunnel() {
  const location = useLocation();
  const initialData = location.state || {};
  const firstFieldRef = useRef(null);

  // Compute active steps based on mortgage answer
  const getActiveSteps = useCallback((data) => {
    return ALL_STEPS.filter(step => {
      if (step.conditional && step.id === 'mortgage-balance') {
        return data['existing-mortgages'] && data['existing-mortgages'] !== 'none';
      }
      if (step.conditional && step.id === 'mortgage-balance-2') {
        return data['existing-mortgages'] === 'two';
      }
      return true;
    });
  }, []);

  // Restore from session
  const savedProgress = loadProgress();
  const restoredData = savedProgress?.formData || initialData;
  const restoredStep = savedProgress?.step || 0;

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

  const STEPS = getActiveSteps(formData);

  const goTo = useCallback((idx) => {
    setSlideDir(idx > currentStep ? 'forward' : 'back');
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
    setFieldErrors({});
    setValidatedFields({});
  }, [currentStep]);

  // Persist progress
  useEffect(() => {
    if (!submitted && !processing) {
      saveProgress(currentStep, formData);
    }
  }, [currentStep, formData, submitted, processing]);

  // Browser back button interception
  useEffect(() => {
    const handlePopState = () => {
      if (submitted || processing) return;
      window.history.pushState({ funnelStep: currentStep }, '');
      if (!exitIntentFired.current) {
        exitIntentFired.current = true;
        setShowExitIntent(true);
      }
    };

    if (!submitted && !processing) {
      window.history.pushState({ funnelStep: currentStep }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep, submitted, processing]);

  // Exit intent detection — 60 seconds idle
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
    resetIdle();

    return () => {
      idleEvents.forEach(evt => document.removeEventListener(evt, resetIdle));
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [submitted, processing, currentStep]);

  // LeadiD initialization
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 40;

    const tryInit = () => {
      attempts++;
      if (window.LeadiD?.formcapture?.init) {
        try {
          window.LeadiD.formcapture.init();
        } catch { /* ignore */ }
        return true;
      }
      return false;
    };

    if (!tryInit() && attempts < maxAttempts) {
      const interval = setInterval(() => {
        if (tryInit() || attempts >= maxAttempts) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

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

  // Google Places API
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
  }, []);

  // Attach Google Places Autocomplete
  useEffect(() => {
    if (!googleLoaded || STEPS[currentStep]?.id !== 'zip') return;

    const input = document.getElementById('field-address');
    if (!input) return;

    input.setAttribute('autocomplete', 'off');

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components'],
    });

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
  }, [currentStep, googleLoaded]);

  // Input masking
  const handleFieldChange = (name, value) => {
    let formatted = value;
    if (name === 'phone') {
      formatted = formatPhone(value);
    } else if (name === 'zip_code') {
      formatted = value.replace(/\D/g, '').slice(0, 5);
    } else if (name === 'dob') {
      formatted = formatDob(value);
    }

    setFormData(prev => ({ ...prev, [name]: formatted }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    if (validatedFields[name]) setValidatedFields(prev => ({ ...prev, [name]: false }));
    if (name === 'email') setEmailSuggestion('');
  };

  // Validate on blur
  const handleFieldBlur = (name) => {
    const value = formData[name] || '';
    const validate = validators[name];
    if (!validate || !value.trim()) return;
    const result = validate(value);
    if (result !== true) {
      setFieldErrors(prev => ({ ...prev, [name]: result }));
      setValidatedFields(prev => ({ ...prev, [name]: false }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
      setValidatedFields(prev => ({ ...prev, [name]: true }));
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

    // When mortgage status changes, recalculate active steps
    if (stepId === 'existing-mortgages') {
      const updatedData = { ...formData, [stepId]: value };
      const newSteps = getActiveSteps(updatedData);
      setTimeout(() => {
        const currentIdx = newSteps.findIndex(s => s.id === stepId);
        if (currentIdx < newSteps.length - 1) goTo(currentIdx + 1);
      }, 300);
    } else {
      setTimeout(() => {
        if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
      }, 300);
    }
  };

  const advanceStep = () => {
    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const card = document.querySelector('.funnel-card');
      if (card) { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); }
      return;
    }
    setFieldErrors({});
    goTo(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const card = document.querySelector('.funnel-card');
      if (card) { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); }
      return;
    }
    setSubmitting(true);

    // Gather compliance tokens
    const trustedFormCertUrl = Array.from(document.querySelectorAll('input[name="xxTrustedFormCertUrl"]'))
      .map(el => el.value).find(v => v) || '';

    const srToken = Array.from(document.querySelectorAll('input[name="SR_TOKEN"], input[name="universal_leadid"], input[name="leadid_token"]'))
      .map(el => el.value).find(v => v) || '';

    // Build HELOC payload
    const payload = {
      product: 'HELOC',
      heloc_amount: formData['heloc_amount'],
      property_type: formData['property-type'],
      property_use: formData['property-use'],
      heloc_purpose: formData['heloc-purpose'],
      annual_income: formData['annual_income'],
      home_value: formData['home_value'],
      existing_mortgages: formData['existing-mortgages'],
      mortgage_balance: formData['mortgage_balance'] || '$0',
      mortgage_balance_2: formData['mortgage_balance_2'] || '$0',
      credit: formData['credit'],
      va_status: formData['va-status'] || 'NO',
      bankruptcy: formData['bankruptcy'] || 'no',
      employment_status: formData['employment-status'] || '7',
      own_home: formData['own-home'] || 'Homeowner',
      time_at_residence: formData['time-at-residence'] || 'More 3 years',
      dob: formData['dob'],
      address: formData['address'],
      zip_code: formData['zip_code'],
      first_name: formData['first_name'],
      last_name: formData['last_name'],
      email: formData['email'],
      phone: formData['phone'],
      trustedFormCertUrl,
      srToken,
    };

    clearProgress();

    setAnimKey(k => k + 1);
    setProcessing(true);
    const submitStart = Date.now();

    try {
      let result;
      const response = await fetch('/api/submit-heloc-lead', {
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

      const elapsed = Date.now() - submitStart;
      if (elapsed < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
      }

      setProcessing(false);
      setSubmitted(true);
      setSubmitting(false);
      setAnimKey(k => k + 1);
    } catch (err) {
      console.error('HELOC submission error:', err);

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

  // Enter key to advance on form/slider steps
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
  });

  // Show equity estimate after home value and mortgage balance steps
  const showEquityEstimate = step && step.id === 'credit' &&
    parseCurrencyToNumber(formData['home_value'] || '$0') > 0;

  return (
    <form className="funnel-page heloc-funnel" onSubmit={e => e.preventDefault()} id="leadform">
      {/* Hidden compliance inputs */}
      <input type="hidden" name="xxTrustedFormCertUrl" />
      <input type="hidden" name="SR_TOKEN" />
      <input type="hidden" id="leadid_token" name="universal_leadid" />

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <ExitIntentModal onStay={() => setShowExitIntent(false)} />
      )}

      {/* Progress */}
      {!submitted && !processing && (
        <HelocProgress currentStep={currentStep} totalSteps={STEPS.length} />
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

              {/* Social proof */}
              <SocialProof stepId={step.id} />

              {/* Equity estimate on later steps */}
              {showEquityEstimate && <EquityEstimate formData={formData} />}

              {step.type === 'slider-heloc-amount' ? (
                <HelocAmountStep formData={formData} onChange={handleFieldChange} />
              ) : step.type === 'slider-home-value' ? (
                <SliderStep fieldName="home_value" formData={formData} onChange={handleFieldChange} min={80000} max={2000000} step={10000} label="Estimated home value" defaultValue={350000} />
              ) : step.type === 'slider-mortgage-balance' ? (
                <SliderStep fieldName="mortgage_balance" formData={formData} onChange={handleFieldChange} min={10000} max={2000000} step={5000} label="Mortgage balance" defaultValue={200000} />
              ) : step.type === 'slider-mortgage-balance-2' ? (
                <SliderStep fieldName="mortgage_balance_2" formData={formData} onChange={handleFieldChange} min={5000} max={500000} step={5000} label="Second mortgage balance" defaultValue={50000} />
              ) : step.type === 'slider-income' ? (
                <SliderStep fieldName="annual_income" formData={formData} onChange={handleFieldChange} min={10000} max={500000} step={5000} label="Annual pre-tax income" defaultValue={75000} />
              ) : step.type === 'options' ? (
                <OptionStep step={step} formData={formData} onSelect={handleOptionSelect} />
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
              {isLast && <LenderLogos />}
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

                {(step.type === 'form' || step.type.startsWith('slider')) && (
                  <div className="funnel-cta-wrap">
                    {isLast ? (
                      <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Agree & See My Results \u2192'}
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={advanceStep}>
                        Next {'\u2192'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* TCPA disclosure on final step */}
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
    </form>
  );
}
