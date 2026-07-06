import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Signup() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim())                         e.name     = 'Name is required';
    if (!form.email.trim())                        e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email    = 'Enter a valid email';
    if (!form.password)                            e.password = 'Password is required';
    else if (form.password.length < 6)             e.password = 'Minimum 6 characters';
    if (!form.confirm)                             e.confirm  = 'Please confirm password';
    else if (form.confirm !== form.password)        e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏫</div>
          <h1>EduManage</h1>
          <p>Create your admin account</p>
        </div>

        {apiError && <div className="error-msg">⚠️ {apiError}</div>}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" type="text" placeholder="Enter your name" value={form.name} onChange={handleChange} className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="admin@school.com" value={form.email} onChange={handleChange} className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirm" type="password" placeholder="Repeat your password" value={form.confirm} onChange={handleChange} className={errors.confirm ? 'input-error' : ''} />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : '🚀 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
