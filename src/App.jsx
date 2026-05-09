import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Membership from './pages/Membership';
import MembershipSuccess from './pages/MembershipSuccess';
import HakaruRSAMembership from './pages/HakaruRSAMembership';
import HakaruRSARenewal from './pages/HakaruRSARenewal';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Committee from './pages/Committee';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import AdminLogin from './pages/AdminLogin';
import AdminGallery from './pages/AdminGallery';
import AdminSiteContent from './pages/AdminSiteContent';
import Donation from './pages/Donation';
import { SiteContentProvider } from './context/SiteContentContext';

// Scroll to top on route change
function ScrollToTopOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/** Site chrome: header + footer. `/membership/become` is a sibling route and never uses this layout. */
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-rsa-gold focus:text-rsa-navy focus:px-4 focus:py-2 focus:rounded-md focus:font-bold"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

/** Membership form with header and footer. */
function MembershipBecomeStandalone() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-rsa-gold focus:text-rsa-navy focus:px-4 focus:py-2 focus:rounded-md focus:font-bold"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">
        <HakaruRSAMembership />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/gallery" element={<AdminGallery />} />
      <Route path="/admin/site-content" element={<AdminSiteContent />} />
      <Route path="/membership/become" element={<MembershipBecomeStandalone />} />
      <Route path="/membership/become/" element={<MembershipBecomeStandalone />} />
      <Route path="/renew" element={<MembershipBecomeStandalone />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/membership/renew" element={<HakaruRSARenewal />} />
        <Route path="/renew" element={<HakaruRSARenewal />} />
        <Route path="/membership/success" element={<MembershipSuccess />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donate" element={<Donation />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <SiteContentProvider>
        <ScrollToTopOnRouteChange />
        <AppContent />
      </SiteContentProvider>
    </Router>
  );
}

export default App;
