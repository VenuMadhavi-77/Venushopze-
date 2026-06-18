import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

const LoginRegister = () => {
  const { user, login, register, error, setError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect handling
  const redirect = searchParams.get('redirect') || '/';

  // Toggle active tab: 'login' or 'register'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user, seller, admin

  const [loading, setLoading] = useState(false);

  // Clear errors on tab change
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      console.error('Auth submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container login-container">
      <div className="login-card card">
        {/* Tab Switcher Buttons */}
        <div className="tab-switcher">
          <button
            onClick={() => setActiveTab('login')}
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          >
            Create Account
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control pad-left"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control pad-left"
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control pad-left"
                placeholder="••••••••"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Choose Role</label>
              <div className="input-icon-wrapper">
                <ShieldCheck size={16} className="input-icon" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-control pad-left"
                >
                  <option value="user">Buyer (Standard Customer)</option>
                  <option value="seller">Seller (Sell Electronics)</option>
                  <option value="admin">Admin (System Manager)</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full submit-btn" disabled={loading}>
            {loading
              ? 'Processing...'
              : activeTab === 'login'
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {activeTab === 'login' ? (
              <>
                New to VenusShopze?{' '}
                <button onClick={() => setActiveTab('register')} className="btn-toggle-link">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setActiveTab('login')} className="btn-toggle-link">
                  Login instead
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          padding-top: 5rem;
          max-width: 460px;
        }
        .login-card {
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .tab-switcher {
          display: flex;
          border-bottom: 2px solid var(--light-gray);
          margin-bottom: 2rem;
        }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.8rem;
          font-size: 1rem;
          font-weight: 700;
          color: var(--gray);
          cursor: pointer;
          transition: var(--transition-fast);
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }
        .tab-btn:hover {
          color: var(--primary);
        }
        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .auth-form {
          margin-top: 1rem;
        }
        .input-icon-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        .pad-left {
          padding-left: 2.8rem;
        }
        .submit-btn {
          margin-top: 1.5rem;
          padding: 0.9rem;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--gray);
          font-weight: 600;
        }
        .btn-toggle-link {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LoginRegister;
