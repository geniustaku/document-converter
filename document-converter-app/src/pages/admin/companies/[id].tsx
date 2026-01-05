// pages/admin/companies/[id].tsx - Admin company detail page
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Company, Invoice, AuthUser } from '@/types/billing';

interface CompanyDetail extends Company {
  user_count?: number;
  invoice_count?: number;
}

export default function AdminCompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/admin/auth/me');
        if (!authRes.ok) {
          router.push('/admin/login');
          return;
        }
        const authData = await authRes.json();
        setAdmin(authData.data);

        const companyRes = await fetch(`/api/admin/companies/${id}`);
        if (!companyRes.ok) throw new Error('Failed to fetch company');
        const companyData = await companyRes.json();
        setCompany(companyData.data);
        setFormData(companyData.data);

        // Fetch company invoices
        const invoicesRes = await fetch(`/api/admin/invoices?company_id=${id}&limit=10`);
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInvoiceStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdate = async () => {
    if (!company) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setCompany({ ...company, ...formData });
        setEditMode(false);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update company');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/admin/companies" className="text-purple-600 hover:underline">
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <>
      <Head>
        <title>{company.name} - Admin | Document Converter Pro</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/admin/dashboard" className="text-xl font-bold text-purple-600">
                  Admin Portal
                </Link>
                <span className="text-gray-300">/</span>
                <Link href="/admin/companies" className="text-gray-600 hover:text-gray-900">
                  Companies
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">{company.company_id}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{admin?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Company Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.subscription_status)}`}>
                    {company.subscription_status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">{company.company_id}</p>
                <p className="text-gray-600 mt-2">{company.email}</p>
              </div>
              <div className="flex space-x-3">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/invoices/new?company_id=${company.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Invoice
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditMode(false); setFormData(company); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
                {editMode ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        name="contact_person"
                        value={formData.contact_person || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                      <input
                        type="text"
                        name="vat_number"
                        value={formData.vat_number || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="subscription_status"
                        value={formData.subscription_status || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="trial">Trial</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="past_due">Past Due</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{company.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{company.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="text-gray-900">{company.contact_person || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">VAT Number</p>
                      <p className="text-gray-900">{company.vat_number || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">
                        {company.address ? (
                          <>
                            {company.address}<br />
                            {company.city} {company.province} {company.postal_code}
                          </>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Settings</h2>
                {editMode ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount (R)</label>
                      <input
                        type="number"
                        name="monthly_amount"
                        value={formData.monthly_amount || 0}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle Day</label>
                      <select
                        name="billing_cycle_day"
                        value={formData.billing_cycle_day || 1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(company.monthly_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Billing Cycle Day</p>
                      <p className="text-gray-900">{company.billing_cycle_day || 1}st of each month</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Invoices */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                  <Link
                    href={`/admin/invoices?company_id=${company.id}`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Invoice #</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Amount</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <Link
                                href={`/admin/invoices/${invoice.id}`}
                                className="text-purple-600 hover:underline"
                              >
                                {invoice.invoice_number}
                              </Link>
                            </td>
                            <td className="py-3 px-2 text-gray-600">{formatDate(invoice.issue_date)}</td>
                            <td className="py-3 px-2 text-right text-gray-900">{formatCurrency(invoice.total_amount)}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No invoices yet</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">{formatDate(company.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Key</span>
                    <span className="text-gray-900 font-mono text-xs">{company.api_key?.slice(0, 12)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Company ID</span>
                    <span className="text-gray-900 font-mono text-xs">{company.company_id}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/admin/invoices/new?company_id=${company.id}`}
                    className="block w-full px-4 py-2 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Invoice
                  </Link>
                  <Link
                    href={`/admin/companies/${company.id}/users`}
                    className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Manage Users
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(company.api_key || '');
                      alert('API Key copied!');
                    }}
                    className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Copy API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
