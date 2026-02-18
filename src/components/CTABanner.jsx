import { Link } from 'react-router-dom';

export default function CTABanner({ title, subtitle, buttonText = 'Get My Free Quote →', to = '/get-started' }) {
  return (
    <section className="cta-banner">
      <div className="container">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <Link to={to} className="btn btn-primary btn-lg">{buttonText}</Link>
      </div>
    </section>
  );
}
