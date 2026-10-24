import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Handle Manual Login & Register
  const handleAuth = async (e) => {
    e.preventDefault();
    
    const endpoint = isLogin 
      ? 'http://127.0.0.1:8000/login' 
      : 'http://127.0.0.1:8000/register';
    
    const payload = isLogin 
      ? { 
          email: e.target.email.value, 
          password: e.target.password.value 
        }
      : { 
          username: e.target.username.value, 
          email: e.target.email.value, 
          password: e.target.password.value 
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user session & redirect to Dashboard
        localStorage.setItem('user', JSON.stringify({
          id: data.user_id || data.id,
          username: data.username,
          email: data.email || payload.email
        }));
        navigate('/dashboard');
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      console.error('Server connection failed:', error);
      alert('Could not connect to the backend server. Is it running?');
    }
  };

  // Handle Google Login & Register
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('http://127.0.0.1:8000/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('user', JSON.stringify({
            id: data.user_id,
            username: data.username
          }));
          navigate('/dashboard');
        } else {
          alert(`Google Login Error: ${data.detail}`);
        }
      } catch (error) {
        console.error('Failed to communicate with backend:', error);
        alert('Server error during Google authentication.');
      }
    },
    onError: () => {
      alert('Google Login Failed or was canceled by the user.');
    }
  });

  return (
    <div className="auth-page">
      <div className="bg-3d-scene">
        <div className="bg-chessboard-tilt">
          <div className="glowing-ambient-light"></div>
          <div className="ambient-particles"></div>
        </div>
      </div>
      
      <div className={`auth-container ${isLogin ? '' : 'right-panel-active'}`}>
        
        {/* Sign Up Form (Left) */}
        <div className="form-container register-container">
          <form onSubmit={handleAuth}>
            <h2>Create Account</h2>
            <p className="subtitle">Join the ultimate chess experience</p>
            <input type="text" name="username" placeholder="Username" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" className="primary-btn">Sign Up</button>
            
            <div className="divider"><span>Or Continue With</span></div>
            
            <button type="button" className="google-btn" onClick={() => handleGoogleAuth()}>
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google logo" />
              Google
            </button>

            <button type="button" className="mobile-toggle" onClick={() => setIsLogin(true)}>
              Already have an account? Sign In
            </button>
          </form>
        </div>

        {/* Login Form (Right) */}
        <div className="form-container login-container">
          <form onSubmit={handleAuth}>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue your match</p>
            <input type="email" name="email" placeholder="you@example.com" required />
            <input type="password" name="password" placeholder="••••••••" required />
            <div className="form-options" style={{ justifyContent: 'flex-end' }}>
              <a href="#forgot">Forgot Password?</a>
            </div>
            <button type="submit" className="primary-btn">Sign In</button>

            <div className="divider"><span>Or Continue With</span></div>
            
            <button type="button" className="google-btn" onClick={() => handleGoogleAuth()}>
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google logo" />
              Google
            </button>

            <button type="button" className="mobile-toggle" onClick={() => setIsLogin(false)}>
              Don't have an account? Sign Up
            </button>
          </form>
        </div>

        {/* Sliding Glass Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="chess-3d-graphic">♘</div>
              <h2>New Challenger?</h2>
              <p>Enter your details and start your journey with us.</p>
              <button type="button" className="ghost-btn" onClick={() => setIsLogin(false)}>Sign Up</button>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="chess-3d-graphic">♙</div>
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info.</p>
              <button type="button" className="ghost-btn" onClick={() => setIsLogin(true)}>Sign In</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}