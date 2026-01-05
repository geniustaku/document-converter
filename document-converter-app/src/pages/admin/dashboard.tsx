// pages/admin/dashboard.tsx - Admin dashboard
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { DashboardStats, AuthUser } from '@/types/billing';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { id: 'companies', label: 'Companies', href: '/admin/companies', icon: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )},
  { id: 'invoices', label: 'Invoices', href: '/admin/invoices', icon: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { id: 'pricing', label: 'Pricing Plans', href: '/admin/pricing', icon: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats & { recent_invoices: any[]; recent_payments: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/admin/auth/me');
        if (!authRes.ok) {
          router.push('/admin/login');
          return;
        }
        const authData = await authRes.json();
        setAdmin(authData.data);

        const statsRes = await fetch('/api/admin/dashboard');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
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
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      paid: { bg: '#f0fdf4', text: '#16a34a' },
      pending: { bg: '#fefce8', text: '#ca8a04' },
      overdue: { bg: '#fef2f2', text: '#dc2626' },
      success: { bg: '#f0fdf4', text: '#16a34a' },
    };
    return styles[status] || { bg: '#f4f4f4', text: '#6e6e6e' };
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e5e5', borderTopColor: '#fa0f00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Document Converter Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', background: '#323232', color: 'white', position: 'fixed', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px' }}>
            <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', background: '#fa0f00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Admin Panel</span>
            </Link>
          </div>

          <nav style={{ flex: 1, marginTop: '8px' }}>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: item.id === 'dashboard' ? '#ffffff' : '#959595',
                  background: item.id === 'dashboard' ? 'rgba(250, 15, 0, 0.15)' : 'transparent',
                  borderLeft: item.id === 'dashboard' ? '3px solid #fa0f00' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '24px', borderTop: '1px solid #4a4a4a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#fa0f00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{admin?.name?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: 0 }}>{admin?.name}</p>
                <p style={{ fontSize: '12px', color: '#959595', margin: 0 }}>{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(220, 38, 38, 0.1)',
                border: 'none',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>Dashboard</h1>
              <p style={{ fontSize: '14px', color: '#6e6e6e', margin: 0 }}>Welcome back, {admin?.name}</p>
            </div>
            <Link
              href="/admin/companies/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#fa0f00',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Company
            </Link>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {/* Total Companies */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6e6e6e', margin: '0 0 4px 0' }}>Total Companies</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>{stats?.total_companies || 0}</p>
              <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{stats?.active_companies || 0} active</p>
            </div>

            {/* Total Revenue */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6e6e6e', margin: '0 0 4px 0' }}>Total Revenue</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>{formatCurrency(stats?.total_revenue || 0)}</p>
              <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{formatCurrency(stats?.revenue_this_month || 0)} this month</p>
            </div>

            {/* Pending Invoices */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fefce8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#ca8a04' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6e6e6e', margin: '0 0 4px 0' }}>Pending Invoices</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>{stats?.pending_invoices || 0}</p>
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{stats?.overdue_invoices || 0} overdue</p>
            </div>

            {/* API Calls */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#fa0f00' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6e6e6e', margin: '0 0 4px 0' }}>API Calls</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>{(stats?.api_calls_this_month || 0).toLocaleString()}</p>
              <p style={{ fontSize: '13px', color: '#6e6e6e', margin: 0 }}>this month</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {/* Recent Invoices */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', margin: 0 }}>Recent Invoices</h2>
                <Link href="/admin/invoices" style={{ fontSize: '13px', fontWeight: '500', color: '#fa0f00', textDecoration: 'none' }}>
                  View All
                </Link>
              </div>
              <div>
                {stats?.recent_invoices && stats.recent_invoices.length > 0 ? (
                  stats.recent_invoices.map((invoice: any) => (
                    <Link
                      key={invoice.id}
                      href={`/admin/invoices/${invoice.id}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f4f4f4', textDecoration: 'none', transition: 'background 0.2s' }}
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#323232', margin: '0 0 2px 0' }}>{invoice.invoice_number}</p>
                        <p style={{ fontSize: '13px', color: '#6e6e6e', margin: 0 }}>{invoice.company_name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#323232', margin: '0 0 4px 0' }}>{formatCurrency(invoice.total_amount)}</p>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          background: getStatusStyle(invoice.status).bg,
                          color: getStatusStyle(invoice.status).text,
                          textTransform: 'capitalize'
                        }}>
                          {invoice.status}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6e6e6e', fontSize: '14px' }}>No recent invoices</div>
                )}
              </div>
            </div>

            {/* Recent Payments */}
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', margin: 0 }}>Recent Payments</h2>
              </div>
              <div>
                {stats?.recent_payments && stats.recent_payments.length > 0 ? (
                  stats.recent_payments.map((payment: any) => (
                    <div key={payment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f4f4f4' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#323232', margin: '0 0 2px 0' }}>{payment.company_name}</p>
                        <p style={{ fontSize: '13px', color: '#6e6e6e', margin: 0 }}>{payment.invoice_number}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', margin: '0 0 2px 0' }}>+{formatCurrency(payment.amount)}</p>
                        <p style={{ fontSize: '12px', color: '#959595', margin: 0 }}>{formatDate(payment.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6e6e6e', fontSize: '14px' }}>No recent payments</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#323232', borderRadius: '8px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 20px 0' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/admin/companies/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Company
              </Link>
              <Link
                href="/admin/invoices/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Invoice
              </Link>
              <Link
                href="/admin/pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Pricing
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
