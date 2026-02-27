import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { identifyChatbaseUser } from '../components/ChatbaseWidget';

const STEPS = [
  {
    id: 'goal',
    label: 'Step 1 of 7',
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
    label: 'Step 2 of 7',
    progressLabel: 'Email',
    title: 'Where should we send your offers?',
    subtitle: "Enter your email so we can start matching you — we'll never spam you.",
    type: 'form',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
    ],
  },
  {
    id: 'property-type',
    label: 'Step 3 of 7',
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
    label: 'Step 4 of 7',
    progressLabel: 'Value',
    title: 'Estimated home value?',
    subtitle: "Your best estimate is fine — we'll verify later.",
    type: 'form',
    fields: [
      { name: 'home_value', label: 'Home Value', type: 'text', placeholder: '$350,000' },
      { name: 'mortgage_balance', label: 'Current Mortgage Balance', type: 'text', placeholder: '$250,000' },
      { name: 'current_rate', label: 'Current Interest Rate', type: 'text', placeholder: '6.5%' },
    ],
  },
  {
    id: 'credit',
    label: 'Step 5 of 7',
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
      ), label: 'Good (680–739)', value: 'good' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ), label: 'Fair (620–679)', value: 'fair' },
      { icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ), label: 'Below 620', value: 'poor' },
    ],
  },
  {
    id: 'zip',
    label: 'Step 6 of 7',
    progressLabel: 'Location',
    title: 'Where is your property located?',
    subtitle: 'Rates vary by location — this helps us find local offers.',
    type: 'form',
    fields: [
      { name: 'zip_code', label: 'Property ZIP Code', type: 'text', placeholder: '90210', maxLength: 5 },
    ],
  },
  {
    id: 'contact',
    label: 'Step 7 of 7 — Almost Done!',
    progressLabel: 'Contact',
    title: 'Complete your profile to see rates',
    subtitle: 'Just a few more details and we\'ll have your personalized rates ready.',
    type: 'form',
    hasConsent: true,
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Smith' },
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
    ],
  },
];

/* --- Progress Bar Component --- */
function SteppedProgress({ currentStep, totalSteps }) {
  const fillPercent = currentStep / (totalSteps - 1) * 100;
  const trackWidth = `calc(${fillPercent}% * (1 - 48px / 100%))`;

  return (
    <div className="funnel-progress">
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
            <div className="progress-dot">
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className="progress-step-label">{step.progressLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Step Components --- */
function OptionStep({ step, formData, onSelect }) {
  return (
    <div className="funnel-options">
      {step.options.map(opt => (
        <div
          key={opt.value}
          className={`funnel-option${formData[step.id] === opt.value ? ' selected' : ''}`}
          onClick={() => onSelect(step.id, opt.value)}
        >
          <span className="option-icon">{opt.icon}</span>
          <span className="option-label">{opt.label}</span>
        </div>
      ))}
    </div>
  );
}

function FormStep({ step, formData, onChange, errors = {} }) {
  return (
    <>
      {step.fields.map(field => (
        <div key={field.name} className="form-group">
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={e => onChange(field.name, e.target.value)}
              style={errors[field.name] ? { borderColor: '#EF4444' } : {}}
            >
              {field.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={formData[field.name] || ''}
              onChange={e => onChange(field.name, e.target.value)}
              style={errors[field.name] ? { borderColor: '#EF4444' } : {}}
            />
          )}
          {errors[field.name] && (
            <span style={{ display: 'block', marginTop: 4, fontSize: '0.78rem', color: '#EF4444' }}>
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

function ConsentBlock({ agreed, onChange }) {
  return (
    <div className="consent-block">
      <label className="consent-label">
        <input type="checkbox" checked={agreed} onChange={e => onChange(e.target.checked)} />
        <span>
          By submitting, I agree to the <Link to="/terms-of-service" target="_blank">Terms of Service</Link> and{' '}
          <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>, and consent to be contacted by
          GetMyRefinance and its lending partners by phone, email, or text at the number provided, including
          via automated technology. This is not a condition of purchase. Msg & data rates may apply.
        </span>
      </label>
    </div>
  );
}

function AIMatchingMessage() {
  return (
    <div className="ai-matching">
      <div className="ai-matching-icon">
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

  useState(() => {
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
  });

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      {/* Animated spinner */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, margin: '0 auto',
          borderRadius: '50%',
          border: '4px solid var(--color-border-light)',
          borderTopColor: 'var(--color-primary-mid)',
          borderRightColor: 'var(--color-secondary)',
          animation: 'spinLoader 1s linear infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
        }}>
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

      {/* Progress bar */}
      <div style={{
        background: 'var(--color-border-light)', borderRadius: 8, height: 10,
        maxWidth: 360, margin: '0 auto 16px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 8,
          background: 'linear-gradient(90deg, var(--color-primary-mid), var(--color-secondary))',
          width: `${progress}%`,
          transition: 'width 0.15s ease',
        }} />
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {Math.round(progress)}% complete
      </div>

      {/* Checklist */}
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
              {i < phase ? '✓' : i === phase ? '...' : (i + 1)}
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

      <style>{`
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ marginBottom: 12 }}>You're All Set!</h2>
      <p style={{ marginBottom: 12, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        Our AI is analyzing your profile and matching you with lenders right now.
      </p>
      <p style={{ marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', fontSize: '0.9rem' }}>
        You'll receive personalized refinance offers within minutes.
      </p>
      <div style={{
        background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
        padding: 24, marginBottom: 32,
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          What happens next:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 380, margin: '0 auto' }}>
          {[
            'Our AI scans 25+ lender programs for your best match',
            'Matched lenders send you personalized rate offers',
            'You compare and choose — zero obligation',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
    </div>
  );
}

/* --- Validation --- */
const validators = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
  phone: v => /^\+?[\d\s\-().]{7,15}$/.test(v.trim()) || 'Please enter a valid phone number.',
  zip_code: v => /^\d{5}$/.test(v.trim()) || 'Please enter a valid 5-digit ZIP code.',
  home_value: v => v.trim().length > 0 || 'Please enter your estimated home value.',
  mortgage_balance: v => v.trim().length > 0 || 'Please enter your current mortgage balance.',
  current_rate: v => v.trim().length > 0 || 'Please enter your current interest rate.',
  first_name: v => v.trim().length > 0 || 'Please enter your first name.',
  last_name: v => v.trim().length > 0 || 'Please enter your last name.',
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

/* --- Main Funnel Component --- */
export default function Funnel() {
  const location = useLocation();
  const initialData = location.state || {};

  const goalMap = {
    'lower-payment': 'lower-payment',
    'lower-rate': 'lower-payment',
    'cash-out': 'cash-out',
    'shorten-term': 'shorten-term',
    'consolidate': 'consolidate',
  };

  const prefilledData = {};
  if (initialData.goal) prefilledData['goal'] = goalMap[initialData.goal] || initialData.goal;
  if (initialData.home_value) prefilledData['home_value'] = initialData.home_value;
  if (initialData.mortgage_balance) prefilledData['mortgage_balance'] = initialData.mortgage_balance;
  if (initialData.zip_code) prefilledData['zip_code'] = initialData.zip_code;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(prefilledData);
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const goTo = useCallback((idx) => {
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
  }, []);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    // TODO: Re-engagement email — when the user enters their email on step 2 and then
    // abandons the funnel, trigger an automated follow-up sequence via your email service
    // (e.g. Mailchimp, SendGrid). Fire a POST to your backend here with `name` === 'email'
    // and `value` as the address captured, along with any formData already collected.
    // Example:
    //   if (name === 'email' && value.includes('@')) {
    //     fetch('/api/leads/partial', { method: 'POST', body: JSON.stringify({ email: value }) });
    //   }
  };

  const handleOptionSelect = (stepId, value) => {
    setFormData(prev => ({ ...prev, [stepId]: value }));
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
    }, 300);
  };

  const advanceStep = () => {
    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    goTo(currentStep + 1);
  };

  const handleSubmit = () => {
    const errors = validateStep(STEPS[currentStep], formData);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    if (!consentAgreed) {
      alert('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // TODO: Send formData to your backend/CRM
    console.log('Lead Data:', formData);

    // Identify user with Chatbase
    identifyChatbaseUser(formData);

    // Show processing animation
    setAnimKey(k => k + 1);
    setProcessing(true);

    // Simulate AI processing, then show success
    setTimeout(() => {
      setProcessing(false);
      setSubmitted(true);
      setAnimKey(k => k + 1);
    }, 6500);
  };

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="funnel-page">
      {/* Header */}
      <div className="funnel-header">
        <Link to="/" className="logo">
          <div className="logo-icon">G</div>
          GetMyRefinance
        </Link>
        <Link to="/" className="funnel-back">✕ Exit</Link>
      </div>

      {/* Stepped Progress Bar */}
      {!submitted && (
        <SteppedProgress currentStep={currentStep} totalSteps={STEPS.length} />
      )}

      {/* Body */}
      <div className="funnel-body">
        <div className="funnel-card" key={animKey}>
          {processing ? (
            <ProcessingScreen />
          ) : submitted ? (
            <SuccessScreen />
          ) : (
            <>
              <div className="funnel-step-label">{step.label}</div>
              <h2>{step.title}</h2>
              <p>{step.subtitle}</p>

              {/* AI message on email step only */}
              {step.id === 'email-capture' && (
                <AIMatchingMessage />
              )}

              {step.type === 'options' ? (
                <OptionStep step={step} formData={formData} onSelect={handleOptionSelect} />
              ) : (
                <FormStep step={step} formData={formData} onChange={handleFieldChange} errors={fieldErrors} />
              )}

              {/* Consent on final step */}
              {step.hasConsent && (
                <ConsentBlock agreed={consentAgreed} onChange={setConsentAgreed} />
              )}

              <div className="funnel-nav">
                {currentStep > 0 ? (
                  <button className="funnel-back" onClick={() => goTo(currentStep - 1)}>
                    ← Back
                  </button>
                ) : <div />}

                {step.type === 'form' && (
                  isLast ? (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                      See My Rates →
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={advanceStep}>
                      Continue →
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
