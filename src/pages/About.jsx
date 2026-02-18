import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';

const companyValues = [
  { icon: '🤝', title: 'Homeowner-First', desc: 'Every decision we make starts with what\'s best for the homeowner. We\'ll never push you toward a lender that isn\'t a good fit.' },
  { icon: '🔍', title: 'Full Transparency', desc: 'No hidden fees, no surprises. We\'re upfront about how we work and how we make money.' },
  { icon: '🛡️', title: 'Data Privacy', desc: 'Your personal and financial information is protected with bank-level encryption and strict privacy policies.' },
];

const contactInfo = [
  { label: 'Email', value: 'support@getmyrefinance.com' },
  { label: 'Phone', value: '(888) 555-0199' },
  { label: 'Hours', value: 'Mon–Fri, 9am–6pm EST' },
];

export default function About() {
  return (
    <>
      <PageHero
        title="About GetMyRefinance"
        subtitle="We're on a mission to make refinancing transparent, fair, and accessible for every homeowner."
      />

      <section className="about-content">
        <div className="container">
          {/* Our Story */}
          <div className="about-grid">
            <div className="about-img-placeholder">🏡</div>
            <div className="about-text">
              <div className="section-label">Our Story</div>
              <h2>Refinancing Shouldn't Be Complicated</h2>
              <p>
                We started GetMyRefinance because we saw too many homeowners leaving
                money on the table. The mortgage industry is complex, and comparing
                lenders on your own is time-consuming and frustrating.
              </p>
              <p>
                Our platform was built to change that. By connecting homeowners with a
                curated network of vetted lenders, we make it simple to compare rates,
                understand your options, and make confident financial decisions — all in
                one place and completely free.
              </p>
            </div>
          </div>

          {/* Transparency */}
          <div className="about-grid" style={{ direction: 'rtl' }}>
            <div className="about-img-placeholder" style={{ direction: 'ltr' }}>📊</div>
            <div className="about-text" style={{ direction: 'ltr' }}>
              <div className="section-label">Our Approach</div>
              <h2>Transparency First</h2>
              <p>
                We believe you deserve to know exactly how our platform works.
                GetMyRefinance is free for homeowners because we're compensated by
                lenders when they earn your business — not by charging you hidden fees.
              </p>
              <p>
                Every lender in our network is licensed, reviewed, and held to strict
                standards. We don't sell your data to the highest bidder — we match you
                with lenders who are genuinely well-suited to your financial situation.
              </p>
            </div>
          </div>

          {/* Values */}
          <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 48 }}>
            <div className="section-label">Our Values</div>
            <h2 className="section-title">What We Stand For</h2>
          </div>

          <div className="values-grid">
            {companyValues.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: 48,
            boxShadow: 'var(--shadow-md)', marginTop: 64, textAlign: 'center',
          }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: 8 }}>Get In Touch</h2>
            <p style={{ marginBottom: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              Have questions about GetMyRefinance? We'd love to hear from you.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
              {contactInfo.map((c, i) => (
                <div key={i}>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>{c.label}</div>
                  <div style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        title="Ready to Get Started?"
        subtitle="See what refinance rates you qualify for — it takes less than 2 minutes."
      />
    </>
  );
}
