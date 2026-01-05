// pages/billing/dashboard.tsx - Client dashboard (Adobe-style design)
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { CompanyDashboardStats, AuthUser } from '@/types/billing';

export default function BillingDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dashboard, setDashboard] = useState<CompanyDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const authRes = await fetch('/api/billing/auth/me');
        if (!authRes.ok) {
          router.push('/billing/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.data);

        // Fetch dashboard data
        const dashRes = await fetch('/api/billing/dashboard');
        if (!dashRes.ok) throw new Error('Failed to fetch dashboard');
        const dashData = await dashRes.json();
        setDashboard(dashData.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/billing/auth/logout', { method: 'POST' });
      localStorage.removeItem('billing_token');
      router.push('/billing/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      sent: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-600',
      active: 'bg-emerald-100 text-emerald-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[#fa0f00] hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | {dashboard?.company?.name || 'Billing Portal'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-[#f4f4f4] flex">
        {/* Sidebar - Dark sidebar on light background */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#323232] flex flex-col transition-all duration-300 ease-in-out`}>
          {/* Logo */}
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

          {/* Navigation */}
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

          {/* User Section */}
          <div className="p-4 border-t border-[#444]">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fa0f00] to-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{dashboard?.company?.name}</p>
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
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div>
              <h1 className="text-gray-900 text-lg font-semibold">Dashboard</h1>
              <p className="text-gray-500 text-sm">Welcome back, {dashboard?.company?.contact_person || dashboard?.company?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm font-mono">
                {dashboard?.company?.company_id}
              </span>
              <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Content */}
          <div className="p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Outstanding Balance */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${dashboard?.outstanding_balance && dashboard.outstanding_balance > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {dashboard?.outstanding_balance && dashboard.outstanding_balance > 0 ? 'Due' : 'Clear'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Outstanding Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard?.outstanding_balance || 0)}</p>
              </div>

              {/* Total Paid */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard?.total_paid || 0)}</p>
              </div>

              {/* Monthly Amount */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(dashboard?.company?.subscription_status || 'pending')}`}>
                    {dashboard?.company?.subscription_status || 'N/A'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Monthly Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard?.company?.monthly_amount || 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Invoice */}
                {dashboard?.current_invoice ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#fa0f00]/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-gray-900 font-semibold">Current Invoice</h2>
                          <p className="text-gray-500 text-sm">{dashboard.current_invoice.invoice_number}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(dashboard.current_invoice.status)}`}>
                          {dashboard.current_invoice.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-gray-500 text-sm">Billing Period</p>
                          <p className="text-gray-900 font-medium">
                            {formatDate(dashboard.current_invoice.billing_period_start)} - {formatDate(dashboard.current_invoice.billing_period_end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Due Date</p>
                          <p className="text-gray-900 font-medium">{formatDate(dashboard.current_invoice.due_date)}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount Due</span>
                          <span className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard.current_invoice.balance_due)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          href={`/billing/invoices/${dashboard.current_invoice.id}`}
                          className="flex-1 px-4 py-3 bg-[#fa0f00] text-white text-center font-medium rounded-lg hover:bg-[#d40d00] transition-colors"
                        >
                          View Invoice
                        </Link>
                        <a
                          href={`/api/billing/invoices/${dashboard.current_invoice.id}/pdf`}
                          className="px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-gray-900 font-semibold mb-1">All Caught Up!</h3>
                    <p className="text-gray-500">No pending invoices at the moment.</p>
                  </div>
                )}

                {/* Recent Invoices */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-gray-900 font-semibold">Recent Invoices</h2>
                    <Link href="/billing/invoices" className="text-[#fa0f00] hover:text-[#d40d00] text-sm font-medium transition-colors">
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {dashboard?.recent_invoices && dashboard.recent_invoices.length > 0 ? (
                      dashboard.recent_invoices.slice(0, 5).map((invoice: any) => (
                        <Link
                          key={invoice.id}
                          href={`/billing/invoices/${invoice.id}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{invoice.invoice_number}</p>
                              <p className="text-gray-500 text-sm">{formatDate(invoice.issue_date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-medium">{formatCurrency(invoice.total_amount)}</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No invoices yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-900 font-semibold mb-4">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm">Company Name</p>
                      <p className="text-gray-900 font-medium">{dashboard?.company?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="text-gray-900 font-medium">{dashboard?.company?.email}</p>
                    </div>
                    {dashboard?.company?.phone && (
                      <div>
                        <p className="text-gray-500 text-sm">Phone</p>
                        <p className="text-gray-900 font-medium">{dashboard.company.phone}</p>
                      </div>
                    )}
                    {dashboard?.company?.vat_number && (
                      <div>
                        <p className="text-gray-500 text-sm">VAT Number</p>
                        <p className="text-gray-900 font-medium">{dashboard.company.vat_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* API Key */}
                {dashboard?.company?.api_key && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-gray-900 font-semibold mb-4">API Access</h3>
                    <div>
                      <p className="text-gray-500 text-sm mb-2">API Key</p>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <code className="text-sm text-gray-700 break-all font-mono">
                          {dashboard.company.api_key.substring(0, 20)}...
                        </code>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Contact support for full API key</p>
                    </div>
                  </div>
                )}

                {/* Need Help */}
                <div className="bg-gradient-to-br from-[#fa0f00]/5 to-white rounded-xl border border-[#fa0f00]/10 p-6">
                  <h3 className="text-gray-900 font-semibold mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-sm mb-4">Contact our support team for any billing inquiries.</p>
                  <a
                    href="mailto:accounts@drop-it.tech"
                    className="inline-flex items-center text-[#fa0f00] hover:text-[#d40d00] font-medium text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    accounts@drop-it.tech
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
