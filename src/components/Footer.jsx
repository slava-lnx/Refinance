import { Link } from 'react-router-dom';

export default function Footer({ minimal = false }) {
  if (minimal) {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
            <div className="footer-legal">
              GetMyRefinance is a product of Slava LLC. NMLS #[OLIVER].
              Not acting as a lender or broker. Equal Housing Opportunity.
            </div>
            <div className="footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <Link to="/">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">G</div>
              GetMyRefinance
            </Link>
            <p>
              GetMyRefinance connects homeowners with trusted lenders to find the best
              refinance rates. Our free marketplace makes comparing offers simple,
              transparent, and stress-free.
            </p>
          </div>
          <div className="footer-col">
            <h4>Refinance</h4>
            <ul>
              <li><Link to="/refinance">Mortgage Refinance</Link></li>
              <li><Link to="/loans">Compare Lenders</Link></li>
              <li><Link to="/calculator">Refinance Calculator</Link></li>
              <li><Link to="/get-started">Get Your Rate</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Loan Options</h4>
            <ul>
              <li><Link to="/loans">Rate &amp; Term</Link></li>
              <li><Link to="/loans">Cash-Out Refinance</Link></li>
              <li><Link to="/loans">FHA Streamline</Link></li>
              <li><Link to="/loans">VA Refinance</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/learn">Learning Center</Link></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            GetMyRefinance is a product of Slava LLC. NMLS #[Oliver].
            GetMyRefinance is not acting as a lender or broker. The information provided
            is not an application for a mortgage loan. If contacted by a lender in our
            network, your quoted rate may vary depending on your property location, credit
            score, loan-to-value ratio, and other factors. Not all loan products are
            available in all states. Equal Housing Opportunity.
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">NMLS Licensing</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
