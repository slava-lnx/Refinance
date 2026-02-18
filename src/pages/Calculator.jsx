import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';

function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = (n) => '$' + Math.round(Math.abs(n)).toLocaleString();

export default function Calculator() {
  const [balance, setBalance] = useState('300000');
  const [currentRate, setCurrentRate] = useState('7.0');
  const [newRate, setNewRate] = useState('6.0');
  const [term, setTerm] = useState('30');
  const [remaining, setRemaining] = useState('27');
  const [closing, setClosing] = useState('4500');

  const results = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const cr = parseFloat(currentRate) || 0;
    const nr = parseFloat(newRate) || 0;
    const t = parseFloat(term) || 30;
    const rem = parseFloat(remaining) || 27;
    const cl = parseFloat(closing) || 0;

    const currentPmt = calcMonthly(b, cr, rem);
    const newPmt = calcMonthly(b, nr, t);
    const savings = currentPmt - newPmt;
    const breakEven = savings > 0 ? Math.ceil(cl / savings) : 0;
    const totalCurrentInt = (currentPmt * rem * 12) - b;
    const totalNewInt = (newPmt * t * 12) - b;
    const lifetime = totalCurrentInt - totalNewInt - cl;

    return { currentPmt, newPmt, savings, breakEven, totalCurrentInt, totalNewInt, lifetime };
  }, [balance, currentRate, newRate, term, remaining, closing]);

  return (
    <>
      <PageHero
        title="Refinance Calculator"
        subtitle="Estimate your new monthly payment and see how much you could save by refinancing."
      />

      <section className="calc-page-content">
        <div className="container">
          <div className="calc-main">
            <div className="calc-inputs">
              <div className="form-group">
                <label>Current Loan Balance</label>
                <input type="text" value={balance} onChange={e => setBalance(e.target.value)} placeholder="300000" />
              </div>
              <div className="form-group">
                <label>Current Interest Rate (%)</label>
                <input type="text" value={currentRate} onChange={e => setCurrentRate(e.target.value)} placeholder="7.0" />
              </div>
              <div className="form-group">
                <label>New Interest Rate (%)</label>
                <input type="text" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="6.0" />
              </div>
              <div className="form-group">
                <label>New Loan Term</label>
                <select value={term} onChange={e => setTerm(e.target.value)}>
                  <option value="30">30 Years</option>
                  <option value="20">20 Years</option>
                  <option value="15">15 Years</option>
                  <option value="10">10 Years</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remaining Term (years)</label>
                <input type="text" value={remaining} onChange={e => setRemaining(e.target.value)} placeholder="27" />
              </div>
              <div className="form-group">
                <label>Estimated Closing Costs</label>
                <input type="text" value={closing} onChange={e => setClosing(e.target.value)} placeholder="4500" />
              </div>
            </div>

            <div className="calc-output">
              <div style={{ marginBottom: 20 }}>
                <div className="calc-result-label">Estimated New Monthly Payment</div>
                <div className="calc-result-value">{fmt(results.newPmt)}</div>
              </div>
              <div className="calc-output-row">
                <div className="calc-output-item">
                  <label>Current Payment</label>
                  <strong>{fmt(results.currentPmt)}</strong>
                </div>
                <div className="calc-output-item">
                  <label>Monthly Savings</label>
                  <strong style={{ color: results.savings >= 0 ? 'var(--color-success)' : '#dc3545' }}>
                    {results.savings >= 0 ? '' : '-'}{fmt(results.savings)}
                  </strong>
                </div>
                <div className="calc-output-item">
                  <label>Break-Even Point</label>
                  <strong>{results.savings > 0 ? `${results.breakEven} months` : 'N/A'}</strong>
                </div>
              </div>
              <div className="calc-output-row" style={{ marginTop: 16 }}>
                <div className="calc-output-item">
                  <label>Total Interest (Current)</label>
                  <strong>{fmt(Math.max(0, results.totalCurrentInt))}</strong>
                </div>
                <div className="calc-output-item">
                  <label>Total Interest (New)</label>
                  <strong>{fmt(Math.max(0, results.totalNewInt))}</strong>
                </div>
                <div className="calc-output-item">
                  <label>Lifetime Savings</label>
                  <strong style={{ color: results.lifetime >= 0 ? 'var(--color-success)' : '#dc3545' }}>
                    {results.lifetime >= 0 ? '' : '-'}{fmt(results.lifetime)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/get-started" className="btn btn-primary btn-lg">Get Real Rates From Lenders →</Link>
              <p className="form-note" style={{ marginTop: 12 }}>
                This calculator provides estimates only. Actual rates and terms may vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        title="Ready to See Real Offers?"
        subtitle="These are estimates. Get actual personalized rates from competing lenders in minutes."
      />
    </>
  );
}
