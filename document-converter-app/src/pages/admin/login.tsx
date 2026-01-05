// pages/admin/login.tsx - Admin login page
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          router.push('/admin/dashboard');
        }
      } catch (e) {}
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.data?.token) {
        localStorage.setItem('admin_token', data.data.token);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Document Converter Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ background: '#323232', padding: '16px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', background: '#fa0f00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                D
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Document Converter Pro</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            {/* Admin Badge */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: '#323232',
                padding: '12px 24px',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#fa0f00',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Admin Portal</span>
              </div>
            </div>

            {/* Login Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              padding: '40px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', marginBottom: '8px' }}>
                  Administrator Access
                </h1>
                <p style={{ fontSize: '14px', color: '#6e6e6e' }}>
                  Sign in to manage the billing system
                </p>
              </div>

              {error && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="email"
                    style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}
                  >
                    Admin Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#959595' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 44px',
                        fontSize: '14px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#fa0f00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(250, 15, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e5';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="admin@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label
                    htmlFor="password"
                    style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#959595' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 44px 12px 44px',
                        fontSize: '14px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#fa0f00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(250, 15, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e5';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? (
                        <svg style={{ width: '18px', height: '18px', color: '#6e6e6e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg style={{ width: '18px', height: '18px', color: '#6e6e6e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: isLoading ? '#959595' : '#fa0f00',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = '#d90d00')}
                  onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = '#fa0f00')}
                >
                  {isLoading ? (
                    <>
                      <svg style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Links */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                href="/billing/login"
                style={{
                  fontSize: '14px',
                  color: '#6e6e6e',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fa0f00'}
                onMouseOut={(e) => e.currentTarget.style.color = '#6e6e6e'}
              >
                Client Portal Login
              </Link>
              <span style={{ margin: '0 16px', color: '#d1d1d1' }}>|</span>
              <Link
                href="/"
                style={{
                  fontSize: '14px',
                  color: '#6e6e6e',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fa0f00'}
                onMouseOut={(e) => e.currentTarget.style.color = '#6e6e6e'}
              >
                Back to Home
              </Link>
            </div>

            {/* Security Note */}
            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: '#fff8e6',
              border: '1px solid #ffd666',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <svg style={{ width: '18px', height: '18px', color: '#d48806', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p style={{ fontSize: '12px', color: '#6e6e6e', lineHeight: '1.5', margin: 0 }}>
                This is a restricted area. Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#323232', padding: '24px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#959595', margin: 0 }}>
              © 2025 Document Converter Pro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
