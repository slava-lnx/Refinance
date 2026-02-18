import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';

const loanTypes = [
  {
    icon: '🏠', title: 'Rate & Term Refinance', color: 'var(--color-accent)', tagBg: 'rgba(46,134,171,0.1)', tagColor: 'var(--color-accent)',
    desc: 'The most common type of refinance. Replace your current mortgage with a new one at a better interest rate or different term length.',
    best: 'Homeowners who want a lower rate, lower payment, or to switch from an ARM to a fixed-rate mortgage.',
    tags: ['15 & 30-year terms', 'Fixed & ARM'],
  },
  {
    icon: '💵', title: 'Cash-Out Refinance', color: 'var(--color-secondary)', tagBg: 'rgba(232,170,66,0.15)', tagColor: '#9E7520',
    desc: 'Borrow more than your current balance and receive the difference in cash. Use it for home improvements, debt consolidation, or other expenses.',
    best: 'Homeowners with significant equity who need cash for renovations, paying off high-interest debt, or major expenses.',
    tags: ['Up to 80% LTV', 'Access equity'],
  },
  {
    icon: '🎖️', title: 'VA Refinance (IRRRL)', color: 'var(--color-success)', tagBg: 'rgba(40,167,69,0.1)', tagColor: 'var(--color-success)',
    desc: 'The VA Interest Rate Reduction Refinance Loan offers streamlined refinancing for eligible veterans and active-duty service members with existing VA loans.',
    best: 'Veterans and active-duty military with an existing VA loan who want lower rates with minimal paperwork.',
    tags: ['No appraisal needed', 'Streamlined process'],
  },
  {
    icon: '🏛️', title: 'FHA Streamline Refinance', color: '#7C4DFF', tagBg: 'rgba(124,77,255,0.1)', tagColor: '#7C4DFF',
    desc: 'A simplified refinance option for homeowners with existing FHA loans. Reduced documentation and faster processing.',
    best: 'Current FHA borrowers who want to lower their rate or switch from an ARM to a fixed rate with less hassle.',
    tags: ['Less documentation', 'Flexible credit'],
  },
];

function LoanCard({ loan }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-md)', padding: 36,
      boxShadow: 'var(--shadow-md)', borderTop: `4px solid ${loan.color}`,
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{loan.icon}</div>
      <h3 style={{ color: 'var(--color-primary)', marginBottom: 8 }}>{loan.title}</h3>
      <p style={{ marginBottom: 20 }}>{loan.desc}</p>
      <div style={{
        background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
          Best for:
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-light)' }}>{loan.best}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {loan.tags.map((tag, i) => (
          <span key={i} style={{
            background: loan.tagBg, color: loan.tagColor,
            padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function Loans() {
  return (
    <>
      <PageHero
        title="Compare Loan Options"
        subtitle="Explore different refinance loan types and find the right fit for your financial goals."
      />

      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 28, marginTop: -40, position: 'relative', zIndex: 1,
          }}>
            {loanTypes.map((loan, i) => <LoanCard key={i} loan={loan} />)}
          </div>

          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-light)', marginBottom: 20 }}>
              Not sure which option is right for you?
            </p>
            <Link to="/get-started" className="btn btn-primary btn-lg">Let Us Match You →</Link>
          </div>
        </div>
      </section>

      <CTABanner
        title="Find the Right Loan for You"
        subtitle="Tell us about your situation and we'll match you with lenders offering the best options."
        buttonText="Get Started Free →"
      />
    </>
  );
}
