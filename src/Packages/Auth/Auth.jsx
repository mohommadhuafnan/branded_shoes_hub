import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import './Auth.css';
import { API_BASE } from '../../lib/api';
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

const API_URL = `${API_BASE}/auth`;

function Auth() {
  const [accountType, setAccountType] = useState('user'); // user | admin
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot', 'verify'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [verifyEmail, setVerifyEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
  const { showToast } = useShop();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const switchView = (newView) => {
    setView(newView);
    setMessage({ type: '', text: '' });
    if (newView !== 'verify') {
        setFormData({ name: '', email: '', password: '' });
    }
  };

  const switchAccountType = (type) => {
    setAccountType(type);
    setView('login');
    setMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '' });
  };

  const safeJson = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (accountType === 'admin') {
        const loginUrl = `${API_URL}/admin-login`
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await safeJson(response);

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: 'admin' }));
        window.dispatchEvent(new Event('storage'));
        if (showToast) showToast('Success', `Welcome Admin!`, 'success');
        navigate('/admin');
        
      } else {
        // Firebase Authentication for User
        if (view === 'signup') {
          const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          
          // Update profile with name
          if (formData.name) {
             await updateProfile(userCredential.user, { displayName: formData.name });
          }

          // Send verification email
          await sendEmailVerification(userCredential.user);
          
          // Force sign out to prevent auto login
          await signOut(auth);

          setVerifyEmail(formData.email);
          switchView('verify');
          
        } else if (view === 'login') {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const user = userCredential.user;

          if (!user.emailVerified) {
            // User hasn't verified email, block access
            await signOut(auth);
            setVerifyEmail(formData.email);
            switchView('verify');
            return;
          }

          // Successful, verified login
          localStorage.setItem('token', user.uid); // Using uid as token for compatibility
          localStorage.setItem('user', JSON.stringify({ 
             name: user.displayName || 'User', 
             email: user.email, 
             role: 'user' 
          }));
          window.dispatchEvent(new Event('storage'));
          
          if (showToast) showToast('Success', `Welcome, ${user.displayName || 'User'}!`, 'success');
          navigate('/');

        } else if (view === 'forgot') {
          await sendPasswordResetEmail(auth, formData.email);
          setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
        }
      }

    } catch (err) {
      let errorMsg = formatFirebaseAuthError(err) || err.message;
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMsg = 'Cannot reach the admin API. Check that your backend is deployed/running and VITE_API_URL points to it.';
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const applySignedInUser = (user) => {
    localStorage.setItem('token', user.uid);
    localStorage.setItem('user', JSON.stringify({
      name: user.displayName || 'User',
      email: user.email,
      role: 'user',
    }));
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
        <h2>{accountType === 'admin' ? 'Admin Login' : 'User Login'}</h2>
        <p>{accountType === 'admin' ? 'Authorized admins only' : 'Log in to access your account'}</p>
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
            {loading ? 'Logging in...' : accountType === 'admin' ? 'Log In as Admin' : 'Log In as User'}
          </button>
          
          {accountType === 'user' && (
            <>
              <div className="auth-divider">or</div>
              <button 
                type="button" 
                className="auth-btn auth-btn-google"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle /> Log in with Google
              </button>
            </>
          )}
        </div>
      </form>

      <div className="auth-links">
        {accountType === 'user' && <button type="button" className="auth-link" onClick={() => switchView('forgot')}>Forgot password?</button>}
        {accountType === 'user' && <button type="button" className="auth-link" onClick={() => switchView('signup')}>Don't have an account? Sign up</button>}
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Create a normal user account</p>
      </div>
      
      {message.text && <div className={`api-message ${message.type}`}>{message.text}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Full Name</label>
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
             {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          
          <div className="auth-divider">or</div>
          
          <button 
            type="button" 
            className="auth-btn auth-btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle /> Sign up with Google
          </button>
        </div>
      </form>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="auth-link" onClick={() => switchView('login')}>Already have an account? Log in</button>
      </div>
    </div>
  );

  const renderForgot = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Reset Password</h2>
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
             {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </div>
      </form>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="auth-link" onClick={() => switchView('login')}>Back to login</button>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Verify Your Email</h2>
        <p>Almost there! We need to verify your email address.</p>
      </div>
      
      <div className="api-message" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
        We have sent you a verification email to <strong>{verifyEmail}</strong>. Please verify it and log in.
      </div>

      <div className="auth-actions">
        <button 
          type="button" 
          className="auth-btn auth-btn-primary" 
          onClick={() => switchView('login')}
        >
          Log In
        </button>
      </div>
    </div>
  );

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-role-switch">
          <button
            type="button"
            className={accountType === 'user' ? 'active' : ''}
            onClick={() => switchAccountType('user')}
          >
            User
          </button>
          <button
            type="button"
            className={accountType === 'admin' ? 'active' : ''}
            onClick={() => switchAccountType('admin')}
          >
            Admin
          </button>
        </div>
        {view === 'login' && renderLogin()}
        {view === 'signup' && accountType === 'user' && renderSignup()}
        {view === 'forgot' && accountType === 'user' && renderForgot()}
        {view === 'verify' && accountType === 'user' && renderVerify()}
      </div>
    </section>
  );
}

export default Auth;

