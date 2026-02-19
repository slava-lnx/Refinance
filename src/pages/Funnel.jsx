import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { identifyChatbaseUser } from '../components/ChatbaseWidget';

const STEPS = [
  {
    id: 'goal',
    label: 'Step 1 of 7',
    title: 'What is your refinance goal?',
    subtitle: 'This helps us match you with the right lenders.',
    type: 'options',
    options: [
      { icon: '📉', label: 'Lower my monthly payment', value: 'lower-payment' },
      { icon: '💰', label: 'Cash out home equity', value: 'cash-out' },
      { icon: '⏱️', label: 'Shorten my loan term', value: 'shorten-term' },
      { icon: '🔄', label: 'Consolidate debt', value: 'consolidate' },
    ],
  },
  {
    id: 'property-type',
    label: 'Step 2 of 7',
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
    label: 'Step 3 of 7',
    title: 'Estimated home value?',
    subtitle: "Your best estimate is fine — we'll verify later.",
    type: 'form',
    fields: [
      { name: 'home_value', label: 'Home Value', type: 'text', placeholder: '$350,000' },
      { name: 'mortgage_balance', label: 'Current Mortgage Balance', type: 'text', placeholder: '$250,000' },
    ],
  },
  {
    id: 'current-rate',
    label: 'Step 4 of 7',
    title: 'Current interest rate?',
    subtitle: "If you're not sure, your best guess works.",
    type: 'form',
    fields: [
      { name: 'current_rate', label: 'Current Interest Rate', type: 'text', placeholder: '6.5%' },
      {
        name: 'loan_type', label: 'Current Loan Type', type: 'select',
        options: [
          { label: 'Select loan type...', value: '' },
          { label: '30-Year Fixed', value: '30-fixed' },
          { label: '15-Year Fixed', value: '15-fixed' },
          { label: 'Adjustable Rate (ARM)', value: 'arm' },
          { label: 'FHA Loan', value: 'fha' },
          { label: 'VA Loan', value: 'va' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
    ],
  },
  {
    id: 'credit',
    label: 'Step 5 of 7',
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
    title: 'Where should we send your rates?',
    subtitle: "We'll match you with lenders and show your personalized offers.",
    type: 'form',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Smith' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
    ],
  },
];

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

function SuccessScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
      <h2 style={{ marginBottom: 12 }}>You're All Set!</h2>
      <p style={{ marginBottom: 32, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        We're matching you with lenders right now. You'll receive personalized
        refinance offers within minutes.
      </p>
      <div style={{
        background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
        padding: 24, marginBottom: 32,
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          What happens next:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
          {[
            'We analyze your profile against 25+ lender programs',
            'Matched lenders send you personalized rate offers',
            'You compare and choose the best offer — no obligation',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <Link to="/" className="btn btn-secondary">Return to Homepage</Link>
    </div>
  );
}

export default function Funnel() {
  const location = useLocation();
  const initialData = location.state || {};

  // Map hero form goal to funnel's goal step format
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
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((idx) => {
    setAnimKey(k => k + 1);
    setCurrentStep(idx);
  }, []);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionSelect = (stepId, value) => {
    setFormData(prev => ({ ...prev, [stepId]: value }));
    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
    }, 300);
  };

  const handleSubmit = () => {
    // TODO: Send formData to your backend/CRM
    console.log('Lead Data:', formData);

    // Identify user with Chatbase so the chatbot knows who they are
    identifyChatbaseUser(formData);

    setAnimKey(k => k + 1);
    setSubmitted(true);
  };

  const step = STEPS[currentStep];
  const progress = submitted ? 100 : ((currentStep + 1) / STEPS.length) * 100;
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

      {/* Progress */}
      <div className="funnel-progress-bar">
        <div className="funnel-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Body */}
      <div className="funnel-body">
        <div className="funnel-card" key={animKey}>
          {submitted ? (
            <SuccessScreen />
          ) : (
            <>
              <div className="funnel-step-label">{step.label}</div>
              <h2>{step.title}</h2>
              <p>{step.subtitle}</p>

              {step.type === 'options' ? (
                <OptionStep step={step} formData={formData} onSelect={handleOptionSelect} />
              ) : (
                <FormStep step={step} formData={formData} onChange={handleFieldChange} />
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
