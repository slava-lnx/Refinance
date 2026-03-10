import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Funnel from './pages/Funnel';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Funnel is the main landing page */}
        <Route path="/" element={<Funnel />} />
        <Route path="/get-started" element={<Funnel />} />

        {/* Legal pages keep header/footer */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}
