import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import './Auth.css';
import { formatFirebaseAuthError } from '../../lib/firebaseAuthErrors';
import { auth } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

/** Official multicolor Google "G" (brand colors). */
function GoogleGIcon({ size = 22 }) {
  return (
    <svg
      className="google-g-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** Customer login / register only. Admin uses `/admin-login` (AdminLogin.jsx). */
function Auth({ initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [verifyEmail, setVerifyEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { showToast } = useShop();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const switchView = (newView) => {
    setView(newView);
    setMessage({ type: '', text: '' });
    if (newView !== 'verify') {
      setFormData({ name: '', email: '', password: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (view === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        if (formData.name) {
          await updateProfile(userCredential.user, { displayName: formData.name });
        }

        await sendEmailVerification(userCredential.user);
        await signOut(auth);

        setVerifyEmail(formData.email);
        switchView('verify');
      } else if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await signOut(auth);
          setVerifyEmail(formData.email);
          switchView('verify');
          return;
        }

        localStorage.setItem('token', user.uid);
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: user.displayName || 'User',
            email: user.email,
            role: 'user',
            photoURL: user.photoURL || '',
          }),
        );
        window.dispatchEvent(new Event('storage'));

        if (showToast) showToast('Success', `Welcome, ${user.displayName || 'User'}!`, 'success');
        navigate('/');
      } else if (view === 'forgot') {
        await sendPasswordResetEmail(auth, formData.email);
        setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
      }
    } catch (err) {
      let errorMsg = formatFirebaseAuthError(err) || err.message;
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMsg = 'Network error. Check your connection and try again.';
      }

      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const applySignedInUser = (user) => {
    localStorage.setItem('token', user.uid);
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: user.displayName || 'User',
        email: user.email,
        role: 'user',
        photoURL: user.photoURL || '',
      }),
    );
    window.dispatchEvent(new Event('storage'));
    if (showToast) showToast('Success', `Welcome, ${user.displayName || 'User'}!`, 'success');
    navigate('/');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        const userCredential = await signInWithPopup(auth, provider);
        applySignedInUser(userCredential.user);
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
          return;
        }
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err) {
      const text = formatFirebaseAuthError(err);
      if (text) setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Log in</h2>
        <p>Sign in to your Shouse Hub account</p>
      </div>

      {message.text && <div className={`api-message ${message.type}`}>{message.text}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <>
            <div className="auth-divider">or</div>
            <button type="button" className="auth-btn auth-btn-google" onClick={handleGoogleSignIn} disabled={loading}>
              <GoogleGIcon />
              <span>Continue with Google</span>
            </button>
          </>
        </div>
      </form>

      <div className="auth-links">
        <button type="button" className="auth-link" onClick={() => switchView('forgot')}>
          Forgot password?
        </button>
        <button type="button" className="auth-link" onClick={() => switchView('signup')}>
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Create account</h2>
        <p>Join Shouse Hub as a customer</p>
      </div>

      {message.text && <div className={`api-message ${message.type}`}>{message.text}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Full name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Create a password (min 6 characters)"
            required
            minLength="6"
          />
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="auth-divider">or</div>

          <button type="button" className="auth-btn auth-btn-google" onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleGIcon />
            <span>Sign up with Google</span>
          </button>
        </div>
      </form>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="auth-link" onClick={() => switchView('login')}>
          Already have an account? Log in
        </button>
      </div>
    </div>
  );

  const renderForgot = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Reset password</h2>
        <p>Enter your email to receive a reset link</p>
      </div>

      {message.text && <div className={`api-message ${message.type}`}>{message.text}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="auth-input"
            placeholder="Enter your registered email"
            required
          />
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </div>
      </form>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="auth-link" onClick={() => switchView('login')}>
          Back to login
        </button>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Verify your email</h2>
        <p>Almost there! We need to verify your email address.</p>
      </div>

      <div
        className="api-message"
        style={{
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          color: '#38bdf8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        We have sent you a verification email to <strong>{verifyEmail}</strong>. Please verify it and log in.
      </div>

      <div className="auth-actions">
        <button type="button" className="auth-btn auth-btn-primary" onClick={() => switchView('login')}>
          Log in
        </button>
      </div>
    </div>
  );

  return (
    <section className="auth-page">
      <div className="auth-container">
        {view === 'login' && renderLogin()}
        {view === 'signup' && renderSignup()}
        {view === 'forgot' && renderForgot()}
        {view === 'verify' && renderVerify()}
      </div>
    </section>
  );
}

export default Auth;
