import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store';

import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import CookieBanner from './components/CookieBanner';
import Chatbot from './components/Chatbot';
import SeoManager from './components/SeoManager';

import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import CGV from './pages/CGV';
import ProPage from './pages/ProPage';
import HowToBuy from './pages/HowToBuy';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import SoumettreArticle from './pages/SoumettreArticle';
import MesSoumissions from './pages/MesSoumissions';
import Lives from './pages/Lives';
import NotFound from './pages/NotFound';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';
import AdminOrders from './pages/admin/AdminOrders';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminSEO from './pages/admin/AdminSEO';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminItemForm from './pages/admin/AdminItemForm';

function PrivateRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, token } = useStore();
  if (!token && !user) return <Navigate to="/" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <BottomNav />
      <CookieBanner />
      <Chatbot />
    </div>
  );
}

function AdminWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default function App() {
  const { fetchMe, fetchFavs, token } = useStore();

  useEffect(() => {
    void fetchMe();
    if (token) void fetchFavs();
  }, [fetchFavs, fetchMe, token]);

  return (
    <BrowserRouter>
      <SeoManager />
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalogue" element={<Layout><Catalogue /></Layout>} />
        <Route path="/article/:id" element={<Layout><ItemDetail /></Layout>} />
        <Route path="/cgv" element={<Layout><CGV /></Layout>} />
        <Route path="/pro" element={<Layout><ProPage /></Layout>} />
        <Route path="/comment-acheter" element={<Layout><HowToBuy /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/soumettre" element={<Layout><SoumettreArticle /></Layout>} />
        <Route path="/lives" element={<Layout><Lives /></Layout>} />
        <Route path="/confidentialite" element={<Layout><div style={{ maxWidth: 800, margin: '4rem auto', padding: '0 2rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}><h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, marginBottom: '2rem' }}>Politique de Confidentialité</h1><p style={{ color: '#9e8e7e', lineHeight: 1.8 }}>Conformément au RGPD, nous collectons uniquement les données nécessaires au fonctionnement de la plateforme. Vos données ne sont jamais revendues à des tiers. Vous disposez d'un droit d'accès, rectification et suppression à contact@magaliberdah.com.</p></div></Layout>} />
        <Route path="/contact" element={<Layout><div style={{ maxWidth: 600, margin: '4rem auto', padding: '0 2rem', textAlign: 'center' }}><h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, marginBottom: '1rem' }}>Contact</h1><p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#9e8e7e', lineHeight: 1.8 }}>Pour toute question, contactez-nous à :<br /><a href="mailto:contact@magaliberdah.com" style={{ color: '#c9a96e' }}>contact@magaliberdah.com</a></p></div></Layout>} />
        <Route path="/a-propos" element={<Layout><div style={{ maxWidth: 800, margin: '4rem auto', padding: '0 2rem' }}><h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, marginBottom: '1.5rem' }}>À propos</h1><p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#9e8e7e', lineHeight: 1.8 }}>Magali Berdah est une plateforme française dédiée à la vente et aux enchères de mode de luxe de seconde main. Notre mission est de connecter acheteurs passionnés et vendeurs professionnels autour de pièces d'exception, authentiques et soigneusement sélectionnées.</p></div></Layout>} />

        {/* User protected */}
        <Route path="/profil" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/mes-achats" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/mes-encheres" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/favoris" element={<PrivateRoute><Layout><Favorites /></Layout></PrivateRoute>} />
        <Route path="/mes-soumissions" element={<PrivateRoute><Layout><MesSoumissions /></Layout></PrivateRoute>} />

        <Route path="/boutique/*" element={<Navigate to="/profil" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminWrapper><AdminLayout /></AdminWrapper></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="articles" element={<AdminItems />} />
          <Route path="articles/nouveau" element={<AdminItemForm />} />
          <Route path="articles/:id/modifier" element={<AdminItemForm />} />
          <Route path="demandes" element={<AdminSubmissions />} />
          <Route path="commandes" element={<AdminOrders />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
