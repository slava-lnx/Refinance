import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';

const articles = [
  { icon: '📉', tag: 'Refinancing', title: 'When Is the Right Time to Refinance Your Mortgage?', desc: 'Learn the key indicators that signal it\'s a good time to refinance — and when you should wait.' },
  { icon: '💵', tag: 'Cash-Out', title: 'Cash-Out Refinance: Pros, Cons, and How It Works', desc: 'Everything you need to know about tapping your home equity through a cash-out refinance.' },
  { icon: '📊', tag: 'Interest Rates', title: 'How Mortgage Interest Rates Are Determined', desc: 'From the Federal Reserve to your credit score — understand what drives the rate you\'re offered.' },
  { icon: '🏠', tag: 'Home Equity', title: 'Home Equity Loan vs. Cash-Out Refinance: Which Is Better?', desc: 'Compare two popular ways to access your home\'s equity and decide which fits your situation.' },
  { icon: '📋', tag: 'Guide', title: 'The Complete Refinancing Checklist', desc: 'Gather documents, understand fees, and navigate the refinance process with confidence.' },
  { icon: '⭐', tag: 'Credit', title: 'How Your Credit Score Affects Your Refinance Rate', desc: 'See how credit tiers map to real rate differences — and tips for improving your score before applying.' },
  { icon: '🎖️', tag: 'VA Loans', title: 'VA Streamline Refinance (IRRRL): A Complete Guide', desc: 'How eligible veterans and service members can refinance with reduced paperwork and lower costs.' },
  { icon: '🔢', tag: 'Calculators', title: 'How to Calculate Your Refinance Break-Even Point', desc: 'Determine how long it takes for your refinance savings to cover the closing costs.' },
  { icon: '🏛️', tag: 'FHA', title: 'FHA Streamline Refinance: Requirements & Benefits', desc: 'A simplified path to lower payments for existing FHA borrowers — with fewer hoops to jump through.' },
];

export default function Learn() {
  return (
    <>
      <PageHero
        title="Learning Center"
        subtitle="Expert guides and practical tips to help you make smarter refinancing decisions."
      />

      <section>
        <div className="container">
          <div className="articles-grid">
            {articles.map((article, i) => (
              <a href="#" key={i} className="article-card">
                <div className="article-img">{article.icon}</div>
                <div className="article-body">
                  <div className="article-tag">{article.tag}</div>
                  <h3>{article.title}</h3>
                  <p>{article.desc}</p>
                  <span className="read-more">Read article →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="Put Your Knowledge to Work"
        subtitle="Now that you know the basics, see what rates are available for your situation."
      />
    </>
  );
}
