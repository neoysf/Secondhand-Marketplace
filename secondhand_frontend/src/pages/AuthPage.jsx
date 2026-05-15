import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ initialTab = 'login' }) {
  const navigate = useNavigate();

  const { login, register } = useAuth();
  const { show } = useToast();

  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  // Register form
  const [regData, setRegData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password2: '',
  });

  const handleLogin = async () => {
    setErrors({});

    if (!loginData.username) {
      return setErrors({
        username: 'Username is required',
      });
    }

    if (!loginData.password) {
      return setErrors({
        password: 'Password is required',
      });
    }

    setLoading(true);

    try {
      await login(
        loginData.username,
        loginData.password
      );

      show('Welcome back!', 'success');

      navigate('/');
    } catch (e) {
      show('Incorrect username or password', 'error');

      setErrors({
        general: 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrors({});

    const errs = {};

    if (!regData.first_name) {
      errs.first_name = 'First name is required';
    }

    if (!regData.email) {
      errs.email = 'Email is required';
    }

    if (!regData.username) {
      errs.username = 'Username is required';
    }

    if (!regData.password) {
      errs.password = 'Password is required';
    }

    if (regData.password !== regData.password2) {
      errs.password2 = 'Passwords do not match';
    }

    if (Object.keys(errs).length) {
      return setErrors(errs);
    }

    setLoading(true);

    try {
      await register(regData);

      show('Account created!', 'success');

      navigate('/');
    } catch (e) {
      const apiErrors = e?.data || {};

      setErrors(apiErrors);

      show('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          second·hand
        </div>

        <div className="auth-subtitle">
          {tab === 'login'
            ? 'Sign in to your account'
            : 'Create a new account'}
        </div>

        <div className="auth-tabs">

          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              navigate('/login');
            }}
          >
            Sign in
          </button>

          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              navigate('/register');
            }}
          >
            Register
          </button>

        </div>

        {tab === 'login' ? (
          <>
            <div className="form-group">
              <label className="form-label">
                Username
              </label>

              <input
                className={`form-input ${errors.username ? 'error' : ''}`}
                type="text"
                placeholder="your_username"
                value={loginData.username}
                onChange={e =>
                  setLoginData(prev => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />

              {errors.username && (
                <div className="form-error">
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>

              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={e =>
                  setLoginData(prev => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                onKeyDown={e =>
                  e.key === 'Enter' && handleLogin()
                }
              />

              {errors.password && (
                <div className="form-error">
                  {errors.password}
                </div>
              )}
            </div>

            {errors.general && (
              <div
                className="form-error"
                style={{ marginBottom: 8 }}
              >
                {errors.general}
              </div>
            )}

            <button
              className="btn-block"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  First name
                </label>

                <input
                  className={`form-input ${errors.first_name ? 'error' : ''}`}
                  placeholder="John"
                  value={regData.first_name}
                  onChange={e =>
                    setRegData(prev => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />

                {errors.first_name && (
                  <div className="form-error">
                    {errors.first_name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Last name
                </label>

                <input
                  className="form-input"
                  placeholder="Smith"
                  value={regData.last_name}
                  onChange={e =>
                    setRegData(prev => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="email@example.com"
                value={regData.email}
                onChange={e =>
                  setRegData(prev => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />

              {errors.email && (
                <div className="form-error">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Username
              </label>

              <input
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="john_smith"
                value={regData.username}
                onChange={e =>
                  setRegData(prev => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />

              {errors.username && (
                <div className="form-error">
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>

              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={regData.password}
                onChange={e =>
                  setRegData(prev => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />

              {errors.password && (
                <div className="form-error">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm password
              </label>

              <input
                className={`form-input ${errors.password2 ? 'error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={regData.password2}
                onChange={e =>
                  setRegData(prev => ({
                    ...prev,
                    password2: e.target.value,
                  }))
                }
              />

              {errors.password2 && (
                <div className="form-error">
                  {errors.password2}
                </div>
              )}
            </div>

            <button
              className="btn-block"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </>
        )}

        <div className="auth-switch">
          {tab === 'login' ? (
            <>
              Don't have an account?{' '}
              <span
                onClick={() => {
                  setTab('register');
                  navigate('/register');
                }}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => {
                  setTab('login');
                  navigate('/login');
                }}
              >
                Sign in
              </span>
            </>
          )}
        </div>

      </div>
    </div>
  );
}