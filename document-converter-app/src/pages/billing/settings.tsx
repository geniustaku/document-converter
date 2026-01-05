// pages/billing/settings.tsx - Client settings page (Adobe-style design)
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { AuthUser, Company } from '@/types/billing';

export default function BillingSettings() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav] = useState('settings');
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/billing/auth/me');
        if (!authRes.ok) {
          router.push('/billing/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.data);

        const dashRes = await fetch('/api/billing/dashboard');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setCompany(dashData.data?.company);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/billing/auth/logout', { method: 'POST' });
    router.push('/billing/login');
  };

  const copyApiKey = () => {
    if (company?.api_key) {
      navigator.clipboard.writeText(company.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/billing/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )},
    { id: 'invoices', label: 'Invoices', href: '/billing/invoices', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'payments', label: 'Payments', href: '/billing/payments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', href: '/billing/settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { id: 'api', label: 'API Access', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )},
    { id: 'security', label: 'Security', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-[#fa0f00] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings | {company?.name || 'Billing Portal'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-[#f4f4f4] flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#323232] flex flex-col transition-all duration-300 ease-in-out`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#444]">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#fa0f00] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
                  </svg>
                </div>
                <span className="text-white font-semibold text-sm">DocConverter Pro</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 bg-[#fa0f00] rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
                </svg>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-[#444] text-gray-400 hover:text-white transition-colors"
            >
              <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  activeNav === item.id
                    ? 'bg-[#fa0f00] text-white'
                    : 'text-gray-400 hover:bg-[#444] hover:text-white'
                }`}
              >
                <span className={activeNav === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#444]">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fa0f00] to-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{company?.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-[#fa0f00] hover:bg-[#444] rounded-lg transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full p-2 text-gray-400 hover:text-[#fa0f00] hover:bg-[#444] rounded-lg transition-colors flex justify-center"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div>
              <h1 className="text-gray-900 text-lg font-semibold">Settings</h1>
              <p className="text-gray-500 text-sm">Manage your account settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm font-mono">
                {company?.company_id}
              </span>
              <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </header>

          <div className="p-8">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#fa0f00] border-b-2 border-[#fa0f00] -mb-px'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-6">Company Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Company Name</label>
                      <p className="text-gray-900 font-medium">{company?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Company ID</label>
                      <p className="text-gray-900 font-mono text-sm">{company?.company_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900">{company?.email}</p>
                    </div>
                    {company?.phone && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Phone</label>
                        <p className="text-gray-900">{company.phone}</p>
                      </div>
                    )}
                    {company?.vat_number && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">VAT Number</label>
                        <p className="text-gray-900">{company.vat_number}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      To update company information, please contact{' '}
                      <a href="mailto:accounts@drop-it.tech" className="text-[#fa0f00] hover:text-[#d40d00]">
                        accounts@drop-it.tech
                      </a>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-6">Billing Address</h3>
                  <div className="space-y-4">
                    {company?.address ? (
                      <>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Street Address</label>
                          <p className="text-gray-900">{company.address}</p>
                        </div>
                        {company.city && (
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">City</label>
                            <p className="text-gray-900">{company.city}</p>
                          </div>
                        )}
                        {company.province && (
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Province/State</label>
                            <p className="text-gray-900">{company.province}</p>
                          </div>
                        )}
                        {company.postal_code && (
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Postal Code</label>
                            <p className="text-gray-900">{company.postal_code}</p>
                          </div>
                        )}
                        {company.country && (
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Country</label>
                            <p className="text-gray-900">{company.country}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">No billing address on file</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                  <h3 className="text-gray-900 font-semibold mb-6">Subscription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        company?.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        company?.subscription_status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {company?.subscription_status || 'N/A'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Billing Cycle Day</p>
                      <p className="text-gray-900 font-medium">Day {company?.billing_cycle_day || 1} of each month</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Monthly Amount</p>
                      <p className="text-gray-900 font-medium">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(company?.monthly_amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-gray-900 font-semibold">API Key</h3>
                      <p className="text-gray-500 text-sm mt-1">Use this key to authenticate API requests</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      company?.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {company?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 font-mono flex-1 break-all">
                        {showApiKey ? company?.api_key : '••••••••••••••••••••••••••••••••'}
                      </code>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title={showApiKey ? 'Hide' : 'Show'}
                        >
                          {showApiKey ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={copyApiKey}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copied ? (
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex">
                      <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-amber-800 font-medium text-sm">Keep your API key secure</p>
                        <p className="text-amber-700 text-sm mt-1">Never share your API key or commit it to version control.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-4">API Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Total API Calls Used</p>
                      <p className="text-2xl font-bold text-gray-900">{company?.api_calls_used?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Monthly Limit</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {company?.api_calls_limit === -1 ? 'Unlimited' : company?.api_calls_limit?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-4">API Documentation</h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to integrate Document Converter Pro into your applications.
                  </p>
                  <a
                    href="https://docs-app.net/docs/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#fa0f00] text-white font-medium rounded-lg hover:bg-[#d40d00] transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    View Documentation
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-6">Account Security</h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="text-gray-900 font-medium">Email Address</p>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">Verified</span>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="text-gray-900 font-medium">Password</p>
                        <p className="text-gray-500 text-sm">Last changed: Unknown</p>
                      </div>
                      <button className="px-4 py-2 text-[#fa0f00] border border-[#fa0f00] rounded-lg hover:bg-[#fa0f00]/5 transition-colors text-sm font-medium">
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-gray-900 font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-500 text-sm">Add an extra layer of security</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-4">Active Sessions</h3>
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">Current Session</p>
                        <p className="text-gray-500 text-sm">Active now</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">This device</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
