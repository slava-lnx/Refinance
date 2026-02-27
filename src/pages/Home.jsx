import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CTABanner from '../components/CTABanner';

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function HeroForm() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [homeValue, setHomeValue] = useState('');
  const [balance, setBalance] = useState('');
  const [zip, setZip] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/get-started', {
      state: {
        goal,
        home_value: homeValue,
        mortgage_balance: balance,
        zip_code: zip,
      },
    });
  };

  return (
    <div className="hero-card">
      <h3>Get Your Free Quote</h3>
      <p className="card-sub">It only takes 60 seconds</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>What's your goal?</label>
          <select value={goal} onChange={e => setGoal(e.target.value)}>
            <option value="" disabled>Select your goal...</option>
            <option value="lower-payment">Lower my monthly payment</option>
            <option value="lower-rate">Get a lower interest rate</option>
            <option value="cash-out">Cash out equity</option>
            <option value="shorten-term">Shorten my loan term</option>
            <option value="consolidate">Consolidate debt</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Home Value</label>
            <input type="text" placeholder="$350,000" value={homeValue} onChange={e => setHomeValue(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mortgage Balance</label>
            <input type="text" placeholder="$250,000" value={balance} onChange={e => setBalance(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Property ZIP Code</label>
          <input type="text" placeholder="Enter ZIP code" maxLength={5} value={zip} onChange={e => setZip(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-lg">
          See My Options →
        </button>
      </form>
      <p className="form-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        {' '}Free &amp; secure. No impact to credit score.
      </p>
    </div>
  );
}

function CalcPreview() {
  const [loan, setLoan] = useState(300000);
  const [rate, setRate] = useState(6);
  const [term, setTerm] = useState(30);

  const calcPayment = () => {
    const r = rate / 100 / 12;
    const n = term * 12;
    if (r === 0) return loan / n;
    return loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  return (
    <div className="calc-preview">
      <h4>Quick Refinance Estimate</h4>
      <div className="calc-slider-group">
        <div className="calc-slider-label">
          <span>Loan Amount</span>
          <span>${loan.toLocaleString()}</span>
        </div>
        <input type="range" className="calc-slider" min={50000} max={1000000} step={5000}
          value={loan} onChange={e => setLoan(Number(e.target.value))} />
      </div>
      <div className="calc-slider-group">
        <div className="calc-slider-label">
          <span>New Interest Rate</span>
          <span>{rate.toFixed(1)}%</span>
        </div>
        <input type="range" className="calc-slider" min={2} max={10} step={0.125}
          value={rate} onChange={e => setRate(Number(e.target.value))} />
      </div>
      <div className="calc-slider-group">
        <div className="calc-slider-label">
          <span>Loan Term</span>
          <span>{term} years</span>
        </div>
        <input type="range" className="calc-slider" min={10} max={30} step={5}
          value={term} onChange={e => setTerm(Number(e.target.value))} />
      </div>
      <div className="calc-result">
        <div className="calc-result-label">Estimated Monthly Payment</div>
        <div className="calc-result-value">${Math.round(calcPayment()).toLocaleString()}</div>
      </div>
    </div>
  );
}

const trustItems = [
  { icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ), text: '256-bit SSL Encrypted' },
  { icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ), text: 'NMLS Licensed' },
  { icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ), text: '25+ Lender Partners' },
  { icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ), text: '100% Free Service' },
];

const steps = [
  { num: 1, title: 'Tell Us Your Goals', desc: 'Answer a few quick questions about your home, current mortgage, and what you\'re looking to achieve.' },
  { num: 2, title: 'Compare Offers', desc: 'We match you with vetted lenders who compete for your business, so you get the best rates and terms.' },
  { num: 3, title: 'Close & Save', desc: 'Pick the offer that works best, connect directly with your lender, and start saving money.' },
];

const values = [
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 11 12 2 2 11"/><path d="M6 11v9a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-9"/>
    </svg>
  ), title: 'Vetted Lender Network', desc: 'Every lender in our network is licensed, reviewed, and held to strict quality standards.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ), title: 'Instant Rate Comparison', desc: 'See personalized rates from multiple lenders in minutes — no lengthy applications required.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ), title: 'Personalized Matching', desc: 'Our algorithm matches your profile with lenders most likely to offer you the best deal.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ), title: 'Your Data, Protected', desc: 'Bank-level encryption and strict privacy policies ensure your information stays secure.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ), title: 'Always Free', desc: 'Our service is completely free. We\'re paid by lenders, never by you.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
    </svg>
  ), title: 'Expert Guidance', desc: 'Our team of mortgage specialists is here to answer questions at every step of the process.' },
];

const loanTypes = [
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 11 12 2 2 11"/><path d="M6 11v9a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-9"/>
    </svg>
  ), title: 'Rate & Term Refinance', desc: 'Replace your current mortgage with a new one at better terms or a lower rate.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ), title: 'Cash-Out Refinance', desc: 'Tap into your home equity for renovations, debt consolidation, or major expenses.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ), title: 'VA Refinance', desc: 'Exclusive refinance options for veterans and active-duty service members.' },
  { icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
    </svg>
  ), title: 'FHA Streamline', desc: 'Simplified refinancing for existing FHA loan holders with less paperwork.' },
];

const testimonials = [
  { stars: 5, quote: 'I was paying 7.2% and thought I was stuck. GetMyRefinance matched me with a lender offering 5.9%. I\'m saving $340 a month now.', initials: 'MR', name: 'Michael R.', detail: 'Saved $340/mo · Phoenix, AZ' },
  { stars: 5, quote: 'The process was incredibly smooth. I compared 4 offers in 10 minutes and closed on a cash-out refi within 3 weeks. Highly recommend.', initials: 'SK', name: 'Sarah K.', detail: 'Cash-Out Refi · Austin, TX' },
  { stars: 5, quote: 'As a veteran, I was worried about finding a good VA refinance. They connected me with a lender who specialized in VA loans. Couldn\'t be happier.', initials: 'JT', name: 'James T.', detail: 'VA Streamline · San Diego, CA' },
];

export default function Home() {
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge"><span>★</span> Trusted by 50,000+ homeowners</div>
            <h1>Find Your <em>Best Refinance</em> Rate in Minutes</h1>
            <p className="hero-text">
              Compare personalized offers from top-rated lenders — all in one place.
              No hidden fees, no pressure. Just smarter refinancing.
            </p>
            <div className="hero-actions">
              <Link to="/get-started" className="btn btn-primary btn-lg">See My Rates →</Link>
              <Link to="/calculator" className="btn btn-outline">Try Our Calculator</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>$2.1B+</strong><span>Loans Matched</span></div>
              <div className="hero-stat"><strong>50K+</strong><span>Happy Homeowners</span></div>
              <div className="hero-stat"><strong>4.8★</strong><span>Average Rating</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <HeroForm />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-bar-inner">
            {trustItems.map((item, i) => (
              <div key={i} className="trust-item">
                <div className="trust-icon">{item.icon}</div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Simple Process</div>
            <h2 className="section-title">How GetMyRefinance Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Three simple steps to find the refinance rate that saves you the most money.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(s => (
              <div key={s.num} className="step-card reveal">
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="why-us">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Why GetMyRefinance</div>
            <h2 className="section-title">Built Around Your Best Interest</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We make refinancing transparent, fast, and stress-free.
            </p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card reveal">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="loan-types">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Explore Options</div>
            <h2 className="section-title">Refinance Loan Options</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Find the right loan type for your financial situation and goals.
            </p>
          </div>
          <div className="loans-grid">
            {loanTypes.map((l, i) => (
              <Link to="/loans" key={i} className="loan-card reveal">
                <div className="loan-card-icon">{l.icon}</div>
                <h4>{l.title}</h4>
                <p>{l.desc}</p>
                <span className="learn-link">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Client Stories</div>
            <h2 className="section-title">What Homeowners Are Saying</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Real results from real people who found their best refinance rate.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card reveal">
                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                <blockquote>"{t.quote}"</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-detail">{t.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="calc-cta">
        <div className="container calc-cta-inner">
          <div>
            <div className="section-label">Free Tools</div>
            <h2 className="section-title">See How Much You Could Save</h2>
            <p className="section-subtitle" style={{ marginBottom: 24 }}>
              Use our refinance calculator to estimate your new monthly payment and
              total savings before you even talk to a lender.
            </p>
            <Link to="/calculator" className="btn btn-secondary btn-lg">Open Calculator →</Link>
          </div>
          <CalcPreview />
        </div>
      </section>

      <CTABanner
        title="Ready to Lower Your Payment?"
        subtitle="Join thousands of homeowners who found better rates through GetMyRefinance. It takes less than 2 minutes."
      />
    </div>
  );
}
