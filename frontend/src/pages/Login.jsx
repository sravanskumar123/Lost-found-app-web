import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = await login(email, password);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="logo-badge">
          <span className="material-icons">radar</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#0f172a' }}>
          Welcome Back
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0, fontWeight: 500 }}>
          Sign in to your campus recovery portal
        </p>
      </div>

      <div className="login-glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              College Email
            </label>
            <input 
              className="input-field" 
              type="email" 
              placeholder="student@campus.edu" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type={obscure ? "password" : "text"} 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ paddingRight: 44 }}
              />
              <span 
                className="material-icons" 
                style={{ position: 'absolute', right: 14, top: 14, cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}
                onClick={() => setObscure(!obscure)}
              >
                {obscure ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>refresh</span>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          <span>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
