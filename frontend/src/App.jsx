import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SubmitItem from './pages/SubmitItem';
import ItemsFeed from './pages/ItemsFeed';
import MyItems from './pages/MyItems';
import ItemClaims from './pages/ItemClaims';
import MyClaims from './pages/MyClaims';
import ItemDetail from './pages/ItemDetail';
import SubmitClaim from './pages/SubmitClaim';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminItems from './pages/AdminItems';
import AdminClaims from './pages/AdminClaims';

function NavigationBar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const navLinks = isAdmin ? [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/users', label: 'Users', icon: 'people' },
    { to: '/admin/items', label: 'Items', icon: 'inventory' },
    { to: '/admin/claims', label: 'Claims', icon: 'verified' },
  ] : [
    { to: '/', label: 'Overview', icon: 'home' },
    { to: '/feed', label: 'Directory', icon: 'search' },
    { to: '/submit', label: 'Post Item', icon: 'add_circle' },
    { to: '/my-items', label: 'My Listings', icon: 'inventory_2' },
    { to: '/my-claims', label: 'My Claims', icon: 'verified' },
  ];

  return (
    <header className="desktop-navbar">
      <Link to={isAdmin ? "/admin" : "/"} className="nav-brand">
        <div className="brand-icon-box">
          <span className="material-icons">radar</span>
        </div>
        <div>
          <div className="brand-title">CAMPUS RECOVERY</div>
          <div className="brand-subtitle">Smart Lost & Found Portal</div>
        </div>
      </Link>

      <nav className="desktop-nav-links">
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`desktop-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-icons">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="desktop-nav-user">
        <div className="user-badge-pill">
          <div className="user-badge-avatar">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <span>
            {user.name 
              ? (user.name.charAt(0).toUpperCase() + user.name.slice(1)) 
              : (user.email ? (user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)) : 'Campus Member')}
          </span>
        </div>

        <button onClick={logout} className="btn-exit" title="Sign out">
          <span className="material-icons" style={{ fontSize: 16 }}>logout</span>
          Exit
        </button>
      </div>
    </header>
  );
}

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#fbfbf9', color: '#0f2942' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span className="material-icons" style={{ fontSize: 44, color: '#0f2942' }}>radar</span>
          <span style={{ fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', fontSize: 13 }}>CAMPUS RECOVERY PORTAL...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="desktop-app-shell">
        {/* Global Desktop Header Navigation */}
        <NavigationBar />

        {/* Spacious Desktop Main Content Viewport */}
        <main className="desktop-main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />)} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Home />) : <Navigate to="/login" />} />
            
            <Route path="/submit" element={user && user.role !== 'admin' ? <SubmitItem /> : <Navigate to="/login" />} />
            <Route path="/feed" element={user && user.role !== 'admin' ? <ItemsFeed /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={user && user.role !== 'admin' ? <ItemDetail /> : <Navigate to="/login" />} />
            <Route path="/item/:id/submit-claim" element={user && user.role !== 'admin' ? <SubmitClaim /> : <Navigate to="/login" />} />
            <Route path="/my-items" element={user && user.role !== 'admin' ? <MyItems /> : <Navigate to="/login" />} />
            <Route path="/item/:id/claims" element={user && user.role !== 'admin' ? <ItemClaims /> : <Navigate to="/login" />} />
            <Route path="/my-claims" element={user && user.role !== 'admin' ? <MyClaims /> : <Navigate to="/login" />} />
            
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={user && user.role === 'admin' ? <AdminUsers /> : <Navigate to="/" />} />
            <Route path="/admin/items" element={user && user.role === 'admin' ? <AdminItems /> : <Navigate to="/" />} />
            <Route path="/admin/claims" element={user && user.role === 'admin' ? <AdminClaims /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
