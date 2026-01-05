// pages/admin/pricing/index.tsx - Admin pricing management
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { SubscriptionPlan, AuthUser } from '@/types/billing';

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

export default function AdminPricing() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

        const res = await fetch('/api/admin/pricing?include_inactive=true');
        if (res.ok) {
          const data = await res.json();
          setPlans(data.data);
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
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/pricing/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPlan.name,
          description: editingPlan.description,
          price_monthly: editingPlan.price_monthly,
          price_yearly: editingPlan.price_yearly,
          price_lifetime: editingPlan.price_lifetime,
          api_calls_limit: editingPlan.api_calls_limit,
          features: editingPlan.features,
          is_active: editingPlan.is_active,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlans(plans.map(p => p.id === editingPlan.id ? data.data : p));
        setEditingPlan(null);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
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
        <title>Pricing Plans | Admin</title>
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
                  color: item.id === 'pricing' ? '#ffffff' : '#959595',
                  background: item.id === 'pricing' ? 'rgba(250, 15, 0, 0.15)' : 'transparent',
                  borderLeft: item.id === 'pricing' ? '3px solid #fa0f00' : '3px solid transparent',
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
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', margin: '0 0 4px 0' }}>Pricing Plans</h1>
              <p style={{ fontSize: '14px', color: '#6e6e6e', margin: 0 }}>Manage subscription plans and pricing</p>
            </div>
          </div>

          {/* Plans Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  overflow: 'hidden',
                  opacity: plan.is_active ? 1 : 0.6
                }}
              >
                <div style={{
                  padding: '20px 24px',
                  background: plan.plan_type === 'lifetime' ? '#323232' : '#fafafa',
                  borderBottom: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: plan.plan_type === 'lifetime' ? '#ffffff' : '#323232', margin: 0 }}>
                      {plan.name}
                    </h3>
                    <span style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      borderRadius: '4px',
                      background: plan.is_active ? '#f0fdf4' : '#f4f4f4',
                      color: plan.is_active ? '#16a34a' : '#6e6e6e'
                    }}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: plan.plan_type === 'lifetime' ? '#b3b3b3' : '#6e6e6e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {plan.plan_type.replace('_', ' ')}
                  </p>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {plan.plan_type !== 'pay_as_you_go' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6e6e6e' }}>Monthly</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#323232' }}>{formatCurrency(plan.price_monthly)}</span>
                      </div>
                    )}
                    {plan.plan_type === 'lifetime' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6e6e6e' }}>One-time</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#323232' }}>{formatCurrency(plan.price_lifetime)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6e6e6e' }}>API Calls</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#323232' }}>
                        {plan.api_calls_limit === -1 ? 'Unlimited' : plan.api_calls_limit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '16px', marginBottom: '20px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#323232', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Features</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plan.features.map((feature, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#16a34a', flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span style={{ fontSize: '13px', color: '#6e6e6e' }}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setEditingPlan(plan)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fa0f00',
                      background: '#ffffff',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{
            background: '#e0f2fe',
            borderRadius: '8px',
            border: '1px solid #7dd3fc',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <svg style={{ width: '24px', height: '24px', color: '#0284c7', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#0c4a6e', margin: '0 0 6px 0' }}>Note: Custom Pricing</h4>
              <p style={{ fontSize: '14px', color: '#075985', margin: 0, lineHeight: '1.5' }}>
                For most clients, you'll set a custom monthly amount when creating their company.
                These subscription plans are for reference and future API-based billing when you implement
                automatic usage tracking.
              </p>
            </div>
          </div>
        </main>

        {/* Edit Plan Modal */}
        {editingPlan && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '480px',
              margin: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#323232', margin: 0 }}>Edit {editingPlan.name}</h3>
                <button
                  onClick={() => setEditingPlan(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#959595'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Name</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Description</label>
                  <textarea
                    value={editingPlan.description || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Monthly Price (R)</label>
                    <input
                      type="number"
                      value={editingPlan.price_monthly}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>API Calls Limit</label>
                    <input
                      type="number"
                      value={editingPlan.api_calls_limit}
                      onChange={(e) => setEditingPlan({ ...editingPlan, api_calls_limit: parseInt(e.target.value) || -1 })}
                      min="-1"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#959595', margin: '4px 0 0 0' }}>-1 for unlimited</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingPlan.is_active}
                    onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#fa0f00' }}
                  />
                  <label htmlFor="is_active" style={{ fontSize: '14px', color: '#323232' }}>Active</label>
                </div>
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  onClick={() => setEditingPlan(null)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6e6e6e',
                    background: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    background: isSaving ? '#959595' : '#fa0f00',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
