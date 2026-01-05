// pages/billing/invoices/[id].tsx - Invoice detail with payment
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Invoice, AuthUser } from '@/types/billing';

// Paystack inline script declaration
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function InvoiceDetail() {
  const router = useRouter();
  const { id, payment } = router.query;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

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

        // Fetch invoice
        const invRes = await fetch(`/api/billing/invoices/${id}`);
        if (!invRes.ok) throw new Error('Failed to fetch invoice');
        const invData = await invRes.json();
        setInvoice(invData.data);

        // Handle payment callback
        if (payment === 'callback') {
          const urlParams = new URLSearchParams(window.location.search);
          const reference = urlParams.get('reference');
          if (reference) {
            await verifyPayment(reference);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router, payment]);

  const handleLogout = async () => {
    await fetch('/api/billing/auth/logout', { method: 'POST' });
    router.push('/billing/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const verifyPayment = async (reference: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/billing/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();

      if (data.success && data.data.status === 'success') {
        setPaymentStatus('success');
        // Refresh invoice
        const invRes = await fetch(`/api/billing/invoices/${id}`);
        const invData = await invRes.json();
        setInvoice(invData.data);
      } else {
        setPaymentStatus('failed');
      }
    } catch (err) {
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/billing/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to Paystack
      window.location.href = data.data.authorization_url;
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invoice not found</p>
          <Link href="/billing/invoices" className="text-blue-600 hover:underline">Back to Invoices</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{invoice.invoice_number} | Billing Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-900">Billing Portal</span>
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/billing/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
                <Link href="/billing/invoices" className="text-blue-600 font-medium">Invoices</Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                  <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Payment Status Banner */}
        {paymentStatus === 'success' && (
          <div className="bg-green-500 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Payment successful! Thank you for your payment.
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-500 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Payment was not successful. Please try again.
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link href="/billing/invoices" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Invoices
          </Link>

          {/* Invoice Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                  <p className="text-slate-300">{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold mb-1">Document Converter Pro</div>
                  <p className="text-slate-300 text-sm">docs-app.net</p>
                  <p className="text-slate-300 text-sm">accounts@drop-it.tech</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-8">
              {/* Bill To & Invoice Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                  <p className="font-semibold text-gray-900 text-lg">{invoice.company_name}</p>
                  {invoice.company_contact && <p className="text-gray-600">Attn: {invoice.company_contact}</p>}
                  {invoice.company_address && <p className="text-gray-600">{invoice.company_address}</p>}
                  {(invoice.company_city || invoice.company_province) && (
                    <p className="text-gray-600">{invoice.company_city} {invoice.company_province} {invoice.company_postal_code}</p>
                  )}
                  {invoice.company_email && <p className="text-gray-600">{invoice.company_email}</p>}
                  {invoice.company_vat_number && <p className="text-gray-600">VAT: {invoice.company_vat_number}</p>}
                </div>
                <div className="text-right">
                  <div className="inline-block bg-gray-50 rounded-lg p-4 text-left">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <span className="text-gray-500">Issue Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(invoice.issue_date)}</span>
                      <span className="text-gray-500">Due Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(invoice.due_date)}</span>
                      <span className="text-gray-500">Billing Period:</span>
                      <span className="font-medium text-gray-900">{formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}</span>
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Qty</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Unit Price</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items?.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="flex justify-between py-3 text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-gray-600">
                    <span>VAT ({invoice.vat_rate}%)</span>
                    <span>{formatCurrency(invoice.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between py-4 text-xl font-bold text-gray-900 border-t-2 border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  {invoice.amount_paid > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>Amount Paid</span>
                      <span>-{formatCurrency(invoice.amount_paid)}</span>
                    </div>
                  )}
                  {invoice.balance_due > 0 && (
                    <div className="flex justify-between py-4 text-xl font-bold text-red-600 border-t border-gray-200">
                      <span>Balance Due</span>
                      <span>{formatCurrency(invoice.balance_due)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="border-t border-gray-200 pt-6 mb-8">
                  {invoice.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                      <p className="text-gray-600 text-sm">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                      <p className="text-gray-600 text-sm">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <a
                  href={`/api/billing/invoices/${invoice.id}/pdf`}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>

                {/* Pay Now Button - Only show if invoice can be paid */}
                {invoice.can_pay && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <button
                    onClick={initiatePayment}
                    disabled={isProcessing}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay Now - {formatCurrency(invoice.balance_due)}
                      </>
                    )}
                  </button>
                )}

                {/* Message when payment not yet available */}
                {!invoice.can_pay && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Payment available after</p>
                    <p className="font-medium text-gray-700">{formatDate(invoice.billing_period_end)}</p>
                  </div>
                )}

                {/* Paid Badge */}
                {invoice.status === 'paid' && (
                  <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 font-semibold rounded-xl">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Paid on {formatDate(invoice.payment_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
              <p>Thank you for your business!</p>
              <p className="mt-1">For payment inquiries, please contact <a href="mailto:accounts@drop-it.tech" className="text-blue-600 hover:underline">accounts@drop-it.tech</a></p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
