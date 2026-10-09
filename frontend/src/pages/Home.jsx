import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user } = useContext(AuthContext);

  const getDisplayName = () => {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.charAt(0).toUpperCase() + user.name.slice(1);
    }
    if (user?.email) {
      const username = user.email.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return 'Campus Member';
  };

  const ActionCard = ({ icon, title, subtitle, gradientClass, linkTo, countBadge }) => (
    <Link to={linkTo} className={`action-card ${gradientClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="icon-box">
          <span className="material-icons">{icon}</span>
        </div>
        {countBadge && (
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
            {countBadge}
          </span>
        )}
      </div>
      <div>
        <h3 className="action-card-title">{title}</h3>
        <p className="action-card-subtitle">{subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, marginTop: 12, opacity: 0.9 }}>
        <span>Explore Now</span>
        <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
      </div>
    </Link>
  );

  return (
    <div>
      {/* Desktop Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)',
        borderRadius: 24,
        padding: '36px 40px',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 28
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <span className="material-icons" style={{ fontSize: 16 }}>verified_user</span>
            Verified Campus Network
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Lost or found something on campus?
          </h1>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.9, lineHeight: 1.5 }}>
            Welcome, <strong>{getDisplayName()}</strong>. Browse recent discoveries, search reported lost items, or publish a notice to help campus belongings find their way back.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/submit" className="btn-primary" style={{ background: 'white', color: 'var(--primary)', padding: '14px 24px', fontSize: 14 }}>
            <span className="material-icons">add_circle</span>
            Report Notice
          </Link>
          <Link to="/feed" style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '14px 24px',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span className="material-icons">search</span>
            Search Directory
          </Link>
        </div>
      </div>

      {/* Action Cards Desktop Grid */}
      <div className="home-desktop-grid">
        <ActionCard 
          icon="search" 
          title="Browse Directory" 
          subtitle="Explore all lost and found listings across university grounds" 
          gradientClass="card-gradient-blue" 
          linkTo="/feed" 
        />
        <ActionCard 
          icon="add_circle" 
          title="Report an Item" 
          subtitle="Publish a detailed notice with photos, categories, and campus locations" 
          gradientClass="card-gradient-orange" 
          linkTo="/submit" 
        />
        <ActionCard 
          icon="inventory" 
          title="My Listings" 
          subtitle="Manage active notices you have reported and see incoming claims" 
          gradientClass="card-gradient-green" 
          linkTo="/my-items" 
        />
        <ActionCard 
          icon="verified" 
          title="My Claims" 
          subtitle="Track verification status, approved claims, and poster contact numbers" 
          gradientClass="card-gradient-purple" 
          linkTo="/my-claims" 
        />
      </div>
    </div>
  );
}

export default Home;
