import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ChatbaseWidget from './components/ChatbaseWidget';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Funnel from './pages/Funnel';
import Calculator from './pages/Calculator';
import Refinance from './pages/Refinance';
import Loans from './pages/Loans';
import Learn from './pages/Learn';
import About from './pages/About';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ChatbaseWidget />
      <Routes>
        {/* Funnel has its own layout (no header/footer) */}
        <Route path="/get-started" element={<Funnel />} />

        {/* All other pages share header/footer */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/refinance" element={<Refinance />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/about" element={<About />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}
