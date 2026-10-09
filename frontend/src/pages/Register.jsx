import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', department: '', year: ''
  });
  const [obscure, setObscure] = useState(true);
  const [obscureConfirm, setObscureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  // Email authenticity state
  const [emailStatus, setEmailStatus] = useState({ checking: false, validFormat: false, available: null, message: '' });
  // Phone authenticity state
  const [phoneStatus, setPhoneStatus] = useState({ validFormat: false, message: '' });

  const navigate = useNavigate();

  // Validate Email Authenticity
  useEffect(() => {
    const email = formData.email.trim();
    if (!email) {
      setEmailStatus({ checking: false, validFormat: false, available: null, message: '' });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailStatus({ checking: false, validFormat: false, available: false, message: 'Invalid email format' });
      return;
    }

    setEmailStatus(prev => ({ ...prev, checking: true, validFormat: true, message: 'Verifying availability...' }));

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/check-email?email=${encodeURIComponent(email)}`);
        if (res.data.exists) {
          setEmailStatus({ checking: false, validFormat: true, available: false, message: 'Email already registered' });
        } else {
          setEmailStatus({ checking: false, validFormat: true, available: true, message: 'Email authentic & available' });
        }
      } catch (err) {
        setEmailStatus({ checking: false, validFormat: true, available: true, message: 'Valid email format' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Validate Phone Authenticity
  useEffect(() => {
    const phone = formData.phone.trim().replace(/\D/g, '');
    if (!phone) {
      setPhoneStatus({ validFormat: false, message: '' });
      return;
    }

    // 10-digit mobile number format
    const isValid = phone.length === 10;
    if (isValid) {
      setPhoneStatus({ validFormat: true, message: 'Valid 10-digit phone number' });
    } else {
      setPhoneStatus({ validFormat: false, message: `Must be 10 digits (${phone.length}/10)` });
    }
  }, [formData.phone]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const hasUpper = (p) => /[A-Z]/.test(p);
  const hasLower = (p) => /[a-z]/.test(p);
  const hasNumber = (p) => /[0-9]/.test(p);
  const hasMinLength = (p) => p.length >= 8;

  const buildCheck = (text, valid) => (
    <div className="validation-rule" style={{ color: valid ? '#10b981' : '#94a3b8' }}>
      <span className="material-icons validation-icon">
        {valid ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {text}
    </div>
  );

  const isFormValid = () => {
    return formData.name.trim() && 
           emailStatus.validFormat && 
           emailStatus.available === true &&
           phoneStatus.validFormat &&
           formData.password && 
           hasUpper(formData.password) && 
           hasLower(formData.password) && 
           hasNumber(formData.password) && 
           hasMinLength(formData.password) &&
           formData.password === formData.confirmPassword && 
           formData.department && 
           formData.year;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please ensure all fields, email, and phone pass verification.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/register', formData);
      alert('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '20px auto 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Login
        </Link>
      </div>

      <div className="desktop-card" style={{ padding: '36px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="logo-badge">
            <span className="material-icons">school</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#0f172a' }}>Join Campus Network</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Verified student and faculty accounts for campus recovery</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Full Name *
            </label>
            <input 
              className="input-field" 
              name="name" 
              placeholder="e.g. John Doe" 
              value={formData.name}
              onChange={handleChange} 
              required 
            />
          </div>
          
          {/* Email with Authenticity Check */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Campus Email *
              </label>
              {emailStatus.message && (
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: emailStatus.available ? '#059669' : (emailStatus.checking ? '#6366f1' : '#e11d48'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  {emailStatus.checking && <span className="material-icons" style={{ fontSize: 13, animation: 'spin 1s linear infinite' }}>sync</span>}
                  {emailStatus.available === true && <span className="material-icons" style={{ fontSize: 13 }}>verified</span>}
                  {emailStatus.available === false && <span className="material-icons" style={{ fontSize: 13 }}>cancel</span>}
                  {emailStatus.message}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type="email" 
                name="email" 
                placeholder="student@campus.edu" 
                value={formData.email}
                onChange={handleChange} 
                required 
                style={{ 
                  borderColor: emailStatus.available === true ? '#10b981' : (emailStatus.available === false ? '#f43f5e' : undefined),
                  paddingRight: 40
                }}
              />
              <span className="material-icons" style={{ 
                position: 'absolute', 
                right: 14, 
                top: 14, 
                fontSize: 20, 
                color: emailStatus.available === true ? '#10b981' : (emailStatus.available === false ? '#f43f5e' : '#cbd5e1') 
              }}>
                {emailStatus.available === true ? 'check_circle' : (emailStatus.available === false ? 'error' : 'mail')}
              </span>
            </div>
          </div>
          
          {/* Phone with 10-Digit Authenticity Check */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Mobile Phone *
              </label>
              {phoneStatus.message && (
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: phoneStatus.validFormat ? '#059669' : '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <span className="material-icons" style={{ fontSize: 13 }}>
                    {phoneStatus.validFormat ? 'check_circle' : 'info'}
                  </span>
                  {phoneStatus.message}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type="tel"
                name="phone" 
                maxLength="10"
                placeholder="10-digit mobile number" 
                value={formData.phone}
                onChange={handleChange} 
                required 
                style={{ 
                  borderColor: phoneStatus.validFormat ? '#10b981' : (formData.phone ? '#f43f5e' : undefined),
                  paddingRight: 40
                }}
              />
              <span className="material-icons" style={{ 
                position: 'absolute', 
                right: 14, 
                top: 14, 
                fontSize: 20, 
                color: phoneStatus.validFormat ? '#10b981' : (formData.phone ? '#f43f5e' : '#cbd5e1') 
              }}>
                {phoneStatus.validFormat ? 'phone_enabled' : 'phone'}
              </span>
            </div>
          </div>
          
          {/* Department & Year */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Academic Department *
            </label>
            <input 
              className="input-field" 
              name="department" 
              placeholder="e.g. Computer Science & Engineering" 
              value={formData.department}
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Academic Year *
            </label>
            <select 
              className="input-field" 
              name="year" 
              value={formData.year} 
              onChange={handleChange} 
              required 
              style={{ color: formData.year ? 'inherit' : '#94a3b8' }}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
              <option value="postgrad">Postgraduate / Faculty</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type={obscure ? "password" : "text"} 
                name="password" 
                placeholder="Enter password" 
                value={formData.password}
                onChange={handleChange} 
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

          {/* Confirm Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type={obscureConfirm ? "password" : "text"} 
                name="confirmPassword" 
                placeholder="Re-enter password" 
                value={formData.confirmPassword}
                onChange={handleChange} 
                required 
                style={{ paddingRight: 44 }}
              />
              <span 
                className="material-icons" 
                style={{ position: 'absolute', right: 14, top: 14, cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}
                onClick={() => setObscureConfirm(!obscureConfirm)}
              >
                {obscureConfirm ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', padding: 14, borderRadius: 14, marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>Verification Requirements</div>
            {buildCheck("Valid & available campus email", emailStatus.validFormat && emailStatus.available === true)}
            {buildCheck("Valid 10-digit mobile number", phoneStatus.validFormat)}
            {buildCheck("At least 8 characters", hasMinLength(formData.password))}
            {buildCheck("Uppercase & Lowercase letters", hasUpper(formData.password) && hasLower(formData.password))}
            {buildCheck("At least one number", hasNumber(formData.password))}
            {buildCheck("Passwords match", formData.password && formData.password === formData.confirmPassword)}
          </div>

          <button className="btn-primary" type="submit" disabled={!isFormValid() || loading}>
            {loading ? 'Verifying & Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
