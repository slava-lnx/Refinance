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
      { icon: '📉', label: 'Lower my monthly payment', value: 'lower-payment' },
      { icon: '💰', label: 'Cash out home equity', value: 'cash-out' },
      { icon: '⏱️', label: 'Shorten my loan term', value: 'shorten-term' },
      { icon: '🔄', label: 'Consolidate debt', value: 'consolidate' },
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
      { icon: '🏠', label: 'Single Family Home', value: 'single-family' },
      { icon: '🏢', label: 'Condo / Townhome', value: 'condo' },
      { icon: '🏘️', label: 'Multi-Family (2-4 units)', value: 'multi-family' },
      { icon: '📦', label: 'Manufactured Home', value: 'manufactured' },
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
      { icon: '🟢', label: 'Excellent (740+)', value: 'excellent' },
      { icon: '🔵', label: 'Good (680–739)', value: 'good' },
      { icon: '🟡', label: 'Fair (620–679)', value: 'fair' },
      { icon: '🔴', label: 'Below 620', value: 'poor' },
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

function FormStep({ step, formData, onChange }) {
  return (
    <>
      {step.fields.map(field => (
        <div key={field.name} className="form-group">
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={e => onChange(field.name, e.target.value)}
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
            />
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
          By submitting, I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and{' '}
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>, and consent to be contacted by
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
      <div className="ai-matching-icon">🤖</div>
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
    { text: 'Analyzing your profile...', icon: '📊' },
    { text: 'Scanning 25+ lender programs...', icon: '🔍' },
    { text: 'Comparing rates & terms...', icon: '📈' },
    { text: 'Finding your best match...', icon: '🎯' },
    { text: 'Preparing your results...', icon: '✨' },
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
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
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

  const goTo = useCallback((idx) => {
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
  }, []);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionSelect = (stepId, value) => {
    setFormData(prev => ({ ...prev, [stepId]: value }));
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
    }, 300);
  };

  const handleSubmit = () => {
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
                <FormStep step={step} formData={formData} onChange={handleFieldChange} />
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
                    <button className="btn btn-primary" onClick={() => goTo(currentStep + 1)}>
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
