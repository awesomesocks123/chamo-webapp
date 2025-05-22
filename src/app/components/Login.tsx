'use client';

import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect will happen automatically through the auth state change
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Redirect will happen automatically through the auth state change
    } catch (error: any) {
      console.error('Error with email authentication:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--light-green)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '24rem'
      }}>
        <h1 style={{
          color: 'var(--dark-green)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {isSignUp ? 'Create an Account' : 'Sign In to Chamo Chat'}
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailAuth} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--dark-grey)'
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid var(--light-grey)',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--dark-grey)'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid var(--light-grey)',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--med-green)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dark-green)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--med-green)'}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{ 
            flex: 1, 
            height: '1px', 
            backgroundColor: 'var(--light-grey)' 
          }}></div>
          <span style={{ 
            padding: '0 0.5rem', 
            color: 'var(--light-grey)', 
            fontSize: '0.875rem' 
          }}>OR</span>
          <div style={{ 
            flex: 1, 
            height: '1px', 
            backgroundColor: 'var(--light-grey)' 
          }}></div>
        </div>
        
        <button 
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'white',
            color: 'var(--dark-grey)',
            border: '1px solid var(--light-grey)',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--off-white)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Sign in with Google
        </button>
        
        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.875rem',
          color: 'var(--dark-grey)' 
        }}>
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dark-green)',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
