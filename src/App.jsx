import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Membership from './pages/Membership';
import MembershipForm from './pages/MembershipForm';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Committee from './pages/Committee';
import Projects from './pages/Projects';

// Scroll to top on route change
function ScrollToTopOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-rsa-gold focus:text-rsa-navy focus:px-4 focus:py-2 focus:rounded-md focus:font-bold"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/membership-form" element={<MembershipForm />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTopOnRouteChange />
      <AppContent />
    </Router>
  );
}

export default App;
