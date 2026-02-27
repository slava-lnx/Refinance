import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon">G</div>
          GetMyRefinance
        </Link>

        <nav className={`nav${mobileOpen ? ' open' : ''}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/refinance" onClick={closeMenu}>Refinance</NavLink>
          <NavLink to="/loans" onClick={closeMenu}>Loan Options</NavLink>
          <NavLink to="/calculator" onClick={closeMenu}>Calculators</NavLink>
          <NavLink to="/learn" onClick={closeMenu}>Learning Center</NavLink>
          <Link to="/get-started" className="btn btn-primary btn-nav nav-cta" onClick={closeMenu}>
            Get Started
          </Link>
        </nav>

        <button
          className="mobile-toggle"
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span style={mobileOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={mobileOpen ? { opacity: 0 } : {}} />
          <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </button>
      </div>
    </header>
  );
}
