import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [strength, setStrength] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const ambiguous = 'il1Lo0O';

  useEffect(() => {
    generatePassword();
  }, []);

  const generatePassword = () => {
    let chars = '';
    let newPassword = '';

    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (excludeAmbiguous) {
      chars = chars.split('').filter(char => !ambiguous.includes(char)).join('');
    }

    if (chars.length === 0) {
      alert('Please select at least one character type');
      return;
    }

    // Generate password
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure at least one character from each selected type
    if (includeUppercase && !/[A-Z]/.test(newPassword)) {
      const pos = Math.floor(Math.random() * length);
      newPassword = newPassword.substring(0, pos) + uppercase.charAt(Math.floor(Math.random() * uppercase.length)) + newPassword.substring(pos + 1);
    }
    if (includeLowercase && !/[a-z]/.test(newPassword)) {
      const pos = Math.floor(Math.random() * length);
      newPassword = newPassword.substring(0, pos) + lowercase.charAt(Math.floor(Math.random() * lowercase.length)) + newPassword.substring(pos + 1);
    }
    if (includeNumbers && !/[0-9]/.test(newPassword)) {
      const pos = Math.floor(Math.random() * length);
      newPassword = newPassword.substring(0, pos) + numbers.charAt(Math.floor(Math.random() * numbers.length)) + newPassword.substring(pos + 1);
    }
    if (includeSymbols && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(newPassword)) {
      const pos = Math.floor(Math.random() * length);
      newPassword = newPassword.substring(0, pos) + symbols.charAt(Math.floor(Math.random() * symbols.length)) + newPassword.substring(pos + 1);
    }

    setPassword(newPassword);
    calculateStrength(newPassword);

    // Add to history (keep last 5)
    setHistory(prev => [newPassword, ...prev].slice(0, 5));
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;

    // Length
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    setStrength(Math.min(score, 5));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return { label: 'Weak', color: 'text-red-600', bg: 'bg-red-600' };
    if (strength <= 3) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-600' };
    if (strength <= 4) return { label: 'Strong', color: 'text-green-600', bg: 'bg-green-600' };
    return { label: 'Very Strong', color: 'text-emerald-600', bg: 'bg-emerald-600' };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <>
      <Head>
        <title>Strong Password Generator - Create Secure Passwords Free | Document Converter Pro</title>
        <meta name="description" content="Generate strong, random passwords online for free. Customizable length and character types. Create secure passwords for your accounts instantly." />
        <meta name="keywords" content="password generator, strong password, random password, secure password, password maker, generate password, password creator" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/password-generator" />
        <meta property="og:title" content="Strong Password Generator - Create Secure Passwords Free" />
        <meta property="og:description" content="Generate strong, secure passwords with our free online tool. Customizable options for maximum security." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Document Converter Pro</h1>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              🔐
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Password Generator</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Create strong, secure, random passwords to keep your accounts safe online.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {/* Generated Password Display */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Generated Password</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-lg font-bold"
                  style={{ letterSpacing: '0.05em', color: '#000000' }}
                />
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>

              {/* Strength Indicator */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Password Strength:</span>
                  <span className={`text-sm font-bold ${strengthInfo.color}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${strengthInfo.bg} transition-all duration-300`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Password Length */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-gray-700">Password Length</label>
                <span className="text-lg font-bold text-blue-600">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            {/* Character Options */}
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Character Types</label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 font-medium">Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 font-medium">Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 font-medium">Numbers (0-9)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 font-medium">Symbols (!@#$%^&*)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 font-medium">Exclude Ambiguous Characters (i, l, 1, L, o, 0, O)</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePassword}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 text-lg"
            >
              Generate New Password
            </button>

            {/* Password History */}
            {history.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Passwords</h3>
                <div className="space-y-2">
                  {history.map((pwd, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono flex-1">{pwd}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pwd);
                          alert('Password copied!');
                        }}
                        className="ml-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Password Security Tips</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Use unique passwords</strong> for each account</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Aim for 16+ characters</strong> for maximum security</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Include all character types</strong> (uppercase, lowercase, numbers, symbols)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Use a password manager</strong> to store passwords securely</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Enable two-factor authentication</strong> (2FA) whenever possible</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span><strong>Never share passwords</strong> or reuse them across sites</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span><strong>Avoid personal information</strong> like names, birthdates, or common words</span>
              </li>
            </ul>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
