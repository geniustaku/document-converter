// pages/admin/invoices/[id].tsx - Admin invoice detail page with edit functionality
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Invoice, InvoiceItem, Payment, AuthUser, InvoiceStatus } from '@/types/billing';

interface InvoiceDetail extends Invoice {
  company_name: string;
  company_email: string;
  company_address?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;
  company_vat_number?: string;
  items: InvoiceItem[];
  payments: Payment[];
}

interface EditableItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function AdminInvoiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [editVatRate, setEditVatRate] = useState(15);
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saveError, setSaveError] = useState('');

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

        const res = await fetch(`/api/admin/invoices/${id}`);
        if (!res.ok) {
          throw new Error('Invoice not found');
        }
        const data = await res.json();
        setInvoice(data.data);
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
    return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      draft: 'bg-gray-100 text-gray-800',
      partially_paid: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Check if invoice can be edited (not paid, cancelled, or refunded)
  const canEdit = invoice && !['paid', 'cancelled', 'refunded'].includes(invoice.status);

  // Start editing mode
  const startEditing = () => {
    if (!invoice) return;
    setEditItems(invoice.items?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })) || []);
    setEditVatRate(invoice.vat_rate);
    setEditIssueDate(formatDateForInput(invoice.issue_date));
    setEditDueDate(formatDateForInput(invoice.due_date));
    setEditNotes(invoice.notes || '');
    setSaveError('');
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError('');
  };

  // Calculate totals for edit preview
  const calculateEditTotals = () => {
    const subtotal = editItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const vatAmount = (subtotal * editVatRate) / 100;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  // Add new item
  const addItem = () => {
    setEditItems([...editItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  // Update item field
  const updateItem = (index: number, field: keyof EditableItem, value: string | number) => {
    const newItems = [...editItems];
    if (field === 'description') {
      newItems[index][field] = value as string;
    } else {
      newItems[index][field] = parseFloat(value as string) || 0;
    }
    setEditItems(newItems);
  };

  // Save changes
  const saveChanges = async () => {
    if (!invoice) return;
    setSaveError('');
    setIsUpdating(true);

    try {
      // Validate items
      if (editItems.length === 0) {
        setSaveError('At least one line item is required');
        setIsUpdating(false);
        return;
      }

      for (const item of editItems) {
        if (!item.description.trim()) {
          setSaveError('All items must have a description');
          setIsUpdating(false);
          return;
        }
        if (item.quantity <= 0) {
          setSaveError('Quantity must be greater than 0');
          setIsUpdating(false);
          return;
        }
        if (item.unit_price < 0) {
          setSaveError('Unit price cannot be negative');
          setIsUpdating(false);
          return;
        }
      }

      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: editItems,
          vat_rate: editVatRate,
          issue_date: editIssueDate,
          due_date: editDueDate,
          notes: editNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || 'Failed to save changes');
        setIsUpdating(false);
        return;
      }

      // Refresh invoice data
      const refreshRes = await fetch(`/api/admin/invoices/${id}`);
      const refreshData = await refreshRes.json();
      setInvoice(refreshData.data);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInvoice({ ...invoice, status: newStatus });
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const markAsPaid = async () => {
    if (!invoice) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          amount_paid: invoice.total_amount,
          balance_due: 0,
          payment_date: new Date().toISOString(),
          payment_method: 'manual',
        }),
      });

      if (res.ok) {
        setInvoice({
          ...invoice,
          status: 'paid',
          amount_paid: invoice.total_amount,
          balance_due: 0,
        });
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'The invoice you are looking for does not exist.'}</p>
          <Link href="/admin/invoices" className="text-purple-600 hover:text-purple-700 font-medium">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const editTotals = isEditing ? calculateEditTotals() : null;

  return (
    <>
      <Head>
        <title>{invoice.invoice_number} | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
          <div className="p-6">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Admin Panel</span>
            </Link>
          </div>

          <nav className="mt-6">
            <Link href="/admin/dashboard" className="flex items-center px-6 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link href="/admin/companies" className="flex items-center px-6 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Companies
            </Link>
            <Link href="/admin/invoices" className="flex items-center px-6 py-3 bg-purple-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoices
            </Link>
            <Link href="/admin/pricing" className="flex items-center px-6 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pricing Plans
            </Link>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/admin/invoices" className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
                <p className="text-gray-500">{invoice.company_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing && (
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Editing
                </span>
              )}
              <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
              </span>
              {!isEditing && (
                <a
                  href={`/api/admin/invoices/${id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company & Invoice Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
                    <p className="font-semibold text-gray-900">{invoice.company_name}</p>
                    <p className="text-gray-600">{invoice.company_email}</p>
                    {invoice.company_address && <p className="text-gray-600">{invoice.company_address}</p>}
                    {invoice.company_city && (
                      <p className="text-gray-600">
                        {invoice.company_city}{invoice.company_province && `, ${invoice.company_province}`} {invoice.company_postal_code}
                      </p>
                    )}
                    {invoice.company_vat_number && <p className="text-gray-600">VAT: {invoice.company_vat_number}</p>}
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Details</h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-end">
                          <label className="text-gray-600 mr-2">Issue Date:</label>
                          <input
                            type="date"
                            value={editIssueDate}
                            onChange={(e) => setEditIssueDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        </div>
                        <div className="flex items-center justify-end">
                          <label className="text-gray-600 mr-2">Due Date:</label>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600">Issue Date: <span className="font-medium text-gray-900">{formatDate(invoice.issue_date)}</span></p>
                        <p className="text-gray-600">Due Date: <span className="font-medium text-gray-900">{formatDate(invoice.due_date)}</span></p>
                      </>
                    )}
                    <p className="text-gray-600 mt-2">Period: <span className="font-medium text-gray-900">{formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}</span></p>
                  </div>
                </div>
              </div>

              {/* Line Items - Edit Mode */}
              {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                    <button
                      onClick={addItem}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </button>
                  </div>

                  {saveError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {saveError}
                    </div>
                  )}

                  <div className="space-y-4">
                    {editItems.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            placeholder="Item description"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs text-gray-500 mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs text-gray-500 mb-1">Unit Price (R)</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28 pt-5">
                          <p className="text-right font-medium text-gray-900">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* VAT Rate */}
                  <div className="mt-6 flex items-center justify-end gap-4">
                    <label className="text-gray-600">VAT Rate (%):</label>
                    <input
                      type="number"
                      value={editVatRate}
                      onChange={(e) => setEditVatRate(parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  {/* Totals Preview */}
                  {editTotals && (
                    <div className="mt-6 border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(editTotals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>VAT ({editVatRate}%):</span>
                        <span className="font-medium text-gray-900">{formatCurrency(editTotals.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                        <span>Total:</span>
                        <span className="text-purple-600">{formatCurrency(editTotals.total)}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      rows={3}
                      placeholder="Optional notes for the invoice"
                    />
                  </div>
                </div>
              ) : (
                /* Line Items - View Mode */
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-gray-900">{item.description}</td>
                          <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-gray-600">Subtotal</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-gray-600">VAT ({invoice.vat_rate}%)</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(invoice.vat_amount)}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold text-gray-900">Total</td>
                        <td className="px-6 py-4 text-right text-lg font-bold text-purple-600">{formatCurrency(invoice.total_amount)}</td>
                      </tr>
                      {invoice.amount_paid > 0 && (
                        <>
                          <tr>
                            <td colSpan={3} className="px-6 py-3 text-right text-gray-600">Amount Paid</td>
                            <td className="px-6 py-3 text-right font-medium text-green-600">-{formatCurrency(invoice.amount_paid)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-6 py-3 text-right text-gray-600 font-semibold">Balance Due</td>
                            <td className="px-6 py-3 text-right font-bold text-red-600">{formatCurrency(invoice.balance_due)}</td>
                          </tr>
                        </>
                      )}
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Notes & Terms - View Mode */}
              {!isEditing && (invoice.notes || invoice.terms) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {invoice.notes && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                      <p className="text-gray-700">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions</h3>
                      <p className="text-gray-700">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              {/* Edit/Save Actions */}
              {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Mode</h3>
                  <div className="space-y-3">
                    <button
                      onClick={saveChanges}
                      disabled={isUpdating}
                      className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isUpdating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={isUpdating}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Quick Actions */
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    {canEdit && (
                      <button
                        onClick={startEditing}
                        className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Invoice
                      </button>
                    )}
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={markAsPaid}
                        disabled={isUpdating}
                        className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as Paid
                      </button>
                    )}
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => updateStatus('pending')}
                        disabled={isUpdating}
                        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send Invoice
                      </button>
                    )}
                    {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                      <button
                        onClick={() => updateStatus('cancelled')}
                        disabled={isUpdating}
                        className="w-full px-4 py-3 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel Invoice
                      </button>
                    )}
                    {!canEdit && (
                      <p className="text-sm text-gray-500 text-center italic">
                        Invoice cannot be edited (status: {invoice.status})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Update Status - Only show when not editing */}
              {!isEditing && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                  <select
                    value={invoice.status}
                    onChange={(e) => updateStatus(e.target.value as InvoiceStatus)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {invoice.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">{payment.payment_method}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${payment.status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                            {payment.status}
                          </p>
                          {payment.processed_at && (
                            <p className="text-xs text-gray-500">{formatDate(payment.processed_at)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Info</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Invoice ID</dt>
                    <dd className="font-medium text-gray-900">{invoice.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="font-medium text-gray-900">{formatDate(invoice.created_at)}</dd>
                  </div>
                  {invoice.payment_reference && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Payment Ref</dt>
                      <dd className="font-medium text-gray-900 text-xs">{invoice.payment_reference}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
