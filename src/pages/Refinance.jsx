import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';

const steps = [
  { num: 1, title: 'Share Your Details', desc: 'Tell us about your home, current mortgage, and refinancing goals. It takes about 2 minutes.' },
  { num: 2, title: 'Get Matched', desc: 'Our system analyzes your profile and matches you with lenders in our network who can offer competitive rates.' },
  { num: 3, title: 'Compare & Choose', desc: 'Review personalized offers, compare rates and terms side by side, and pick the best option for you.' },
];

export default function Refinance() {
  return (
    <>
      <PageHero
        title="Mortgage Refinance"
        subtitle="Compare refinance offers from top-rated lenders and find the rate that saves you the most."
      />

      <section style={{ padding: '60px 0 40px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: 48,
            boxShadow: 'var(--shadow-lg)', marginTop: -40, position: 'relative', zIndex: 1,
          }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: 8, fontSize: '1.6rem' }}>
              Why Refinance Your Mortgage?
            </h2>
            <p style={{ marginBottom: 24 }}>
              Refinancing replaces your existing mortgage with a new loan — ideally with
              better terms. Whether you want to lower your monthly payment, reduce your
              interest rate, shorten your loan term, or access your home's equity,
              refinancing can be a powerful financial tool.
            </p>

            <h3 style={{ color: 'var(--color-primary)', marginBottom: 12, marginTop: 32 }}>
              When Does Refinancing Make Sense?
            </h3>
            <p style={{ marginBottom: 16 }}>
              Refinancing isn't right for everyone, but it can be a smart move in the right
              circumstances. You should consider refinancing if current interest rates are
              lower than your existing rate (typically by at least 0.5–1%), if you want to
              switch from an adjustable-rate mortgage to a fixed rate, if you need to access
              cash from your home equity for renovations or debt consolidation, or if your
              credit score has improved significantly since your original loan.
            </p>

            <h3 style={{ color: 'var(--color-primary)', marginBottom: 12, marginTop: 32 }}>
              How GetMyRefinance Helps
            </h3>
            <p style={{ marginBottom: 24 }}>
              Instead of spending hours calling individual lenders, GetMyRefinance lets you
              compare personalized refinance offers from multiple vetted lenders in one place.
              Our platform analyzes your financial profile, matches you with lenders most
              likely to offer competitive rates, and puts you in control of the decision.
            </p>

            <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
              <Link to="/get-started" className="btn btn-primary btn-lg">
                Compare Refinance Rates →
              </Link>
              <p className="form-note" style={{ marginTop: 12 }}>
                Free • No obligation • Takes 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">The Process</div>
            <h2 className="section-title">How Our Refinance Matching Works</h2>
          </div>
          <div className="steps-grid">
            {steps.map(s => (
              <div key={s.num} className="step-card">
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="See What Rates You Qualify For"
        subtitle="It's free, fast, and won't affect your credit score until you choose to apply."
      />
    </>
  );
}
