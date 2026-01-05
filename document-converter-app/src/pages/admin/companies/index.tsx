// pages/admin/companies/index.tsx - Admin companies list
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Company, AuthUser } from '@/types/billing';

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

export default function AdminCompanies() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });

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

        const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20' });
        if (filter !== 'all') params.append('status', filter);
        if (search) params.append('search', search);

        const res = await fetch(`/api/admin/companies?${params}`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.data);
          if (data.pagination) setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, filter, search, pagination.page]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      active: { bg: '#f0fdf4', text: '#16a34a' },
      suspended: { bg: '#fef2f2', text: '#dc2626' },
      cancelled: { bg: '#f4f4f4', text: '#6e6e6e' },
      pending: { bg: '#fefce8', text: '#ca8a04' },
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
        <title>Companies | Admin</title>
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
                  color: item.id === 'companies' ? '#ffffff' : '#959595',
                  background: item.id === 'companies' ? 'rgba(250, 15, 0, 0.15)' : 'transparent',
                  borderLeft: item.id === 'companies' ? '3px solid #fa0f00' : '3px solid transparent',
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
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>Companies</h1>
              <p style={{ fontSize: '14px', color: '#6e6e6e', margin: 0 }}>Manage your client companies</p>
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

          {/* Filters */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6e6e6e' }}>Status:</span>
                {['all', 'active', 'suspended', 'pending'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setPagination(p => ({ ...p, page: 1 })); }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: 'none',
                      background: filter === f ? '#fef2f2' : 'transparent',
                      color: filter === f ? '#fa0f00' : '#6e6e6e',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '10px 16px 10px 40px',
                    fontSize: '14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '280px',
                    transition: 'border-color 0.2s'
                  }}
                />
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#959595' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Billing</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <tr key={company.id} style={{ borderBottom: '1px solid #f4f4f4', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <Link href={`/admin/companies/${company.id}`} style={{ fontSize: '14px', fontWeight: '600', color: '#323232', textDecoration: 'none' }}>
                          {company.name}
                        </Link>
                        <p style={{ fontSize: '12px', color: '#959595', margin: '2px 0 0 0' }}>{company.company_id}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: '14px', color: '#323232', margin: 0 }}>{company.email}</p>
                        {company.phone && <p style={{ fontSize: '12px', color: '#959595', margin: '2px 0 0 0' }}>{company.phone}</p>}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#323232', margin: 0 }}>{formatCurrency(company.monthly_amount)}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          background: getStatusStyle(company.subscription_status).bg,
                          color: getStatusStyle(company.subscription_status).text,
                          textTransform: 'capitalize'
                        }}>
                          {company.subscription_status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6e6e6e' }}>
                        {company.next_billing_date ? formatDate(company.next_billing_date) : '-'}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link
                            href={`/admin/companies/${company.id}`}
                            style={{
                              padding: '8px',
                              color: '#959595',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              transition: 'all 0.2s'
                            }}
                            title="View"
                          >
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/invoices/new?company=${company.id}`}
                            style={{
                              padding: '8px',
                              color: '#959595',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              transition: 'all 0.2s'
                            }}
                            title="Create Invoice"
                          >
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e6e', fontSize: '14px' }}>
                      No companies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {pagination.total_pages > 1 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '13px', color: '#6e6e6e', margin: 0 }}>
                  Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: pagination.page === 1 ? '#d1d1d1' : '#323232',
                      cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.total_pages}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: pagination.page === pagination.total_pages ? '#d1d1d1' : '#323232',
                      cursor: pagination.page === pagination.total_pages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
