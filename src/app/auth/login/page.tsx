'use client';

import { useContext, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Import the login background image
import loginBg from '../../assets/login-bg.png';
// Import Firebase authentication
import { signInWithGoogle } from '../../lib/firebase';

export default function LoginPage() {
    const { authUser, setAuthUser } = useContext(AuthContext);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");
            
            // Use Firebase Google authentication
            const user = await signInWithGoogle();
            
            if (user) {
                // Set the authenticated user in context
                setAuthUser(user.uid);
                
                // Redirect to chat page
                router.push('/chat');
            }
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            setErrorMessage(error.message || "Failed to sign in with Google. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            backgroundColor: 'var(--med-green)',
            color: 'var(--dark-grey)',
            fontFamily: 'Inter, sans-serif',
            display: 'flex'
        }}>
            <div style={{
                width: '600px',
                minWidth: '600px',
                minHeight: '585.33px',
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '30px'
            }}>
                <div style={{
                    width: '357px',
                    height: '357px',
                    borderRadius: '50%',
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Image 
                        src={loginBg} 
                        alt="Login Background" 
                        id="login-bg-logo"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome to Chamo!</h2>
                    <p style={{ color: 'var(--dark-grey)' }}>Sign in to start chatting with your friends.</p>
                </div>
            </div>
            <div style={{
                flex: '1 1 auto',
                width: '100px',
                minWidth: '380px',
                minHeight: '585.33px',
                paddingLeft: '30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--off-white)',
                color: 'var(--dark-green)',
                borderColor: 'var(--light-grey)'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '15px',
                    width: '310px'
                }}>
                    <h1 style={{
                        fontWeight: 800,
                        fontSize: '64px',
                        marginBottom: '70px',
                        marginTop: '-75px'
                    }}>Chamo</h1>
                    
                    {errorMessage && (
                        <p style={{ color: 'red', margin: '-8px 0' }}>{errorMessage}</p>
                    )}
                    
                    <button 
                        onClick={handleGoogleSignIn}
                        style={{
                            minWidth: '260px',
                            minHeight: '40px',
                            borderRadius: '5px',
                            backgroundColor: 'white',
                            color: 'var(--dark-grey)',
                            fontWeight: 'bold',
                            border: '1px solid var(--light-grey)',
                            cursor: isLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--off-white)')}
                        onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'white')}
                        disabled={isLoading}
                        type="button"
                    >
                        {isLoading ? (
                            'Signing in...'
                        ) : (
                            <>
                                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                    
                    <p style={{ textAlign: 'center', width: '100%', margin: '1rem 0', fontSize: '0.9rem', color: 'var(--light-grey)' }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                    
                    <Link 
                        href="/privacy"
                        style={{
                            color: 'var(--dark-green)',
                            textDecoration: 'none',
                            margin: '1rem 0',
                            alignSelf: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--med-green)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--dark-green)'}
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
