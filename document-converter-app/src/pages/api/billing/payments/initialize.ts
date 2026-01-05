// pages/api/billing/payments/initialize.ts - Initialize Paystack payment
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, generatePaymentId } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, PaystackInitializeResponse } from '@/types/billing';
import https from 'https';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://docs-app.net';

// Helper function to make HTTPS requests (fixes Node.js 18+ IPv6 DNS issues)
async function httpsRequest(url: string, options: https.RequestOptions, body?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, family: 4 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ authorization_url: string; reference: string }>>,
  user: AuthUser
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { invoice_id } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ success: false, error: 'Invoice ID is required' });
    }

    // Get invoice
    const invoiceResult = await query<any>(
      `SELECT i.*, c.email as company_email, c.name as company_name
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE i.id = @invoice_id AND c.id = @company_id`,
      [
        { name: 'invoice_id', type: sql.Int, value: invoice_id },
        { name: 'company_id', type: sql.Int, value: user.company_id },
      ]
    );

    if (invoiceResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const invoice = invoiceResult.recordset[0];

    // Check if invoice is payable
    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Invoice is already paid' });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Invoice has been cancelled' });
    }

    // Check if due date has passed (Pay Now only available after due date)
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For this requirement: Pay Now button only available when the date assigned to a company passes
    // Typically invoices are due on the 1st of the next month for the previous cycle
    // We allow payment once the billing period ends or when the due date arrives
    const billingPeriodEnd = new Date(invoice.billing_period_end);
    if (today < billingPeriodEnd) {
      return res.status(400).json({
        success: false,
        error: `Payment will be available after the billing period ends (${billingPeriodEnd.toLocaleDateString()})`,
      });
    }

    // Generate payment reference
    const paymentId = generatePaymentId();
    const reference = `${paymentId}_${invoice.invoice_number}`.replace(/-/g, '');

    // Amount in kobo (Paystack requires smallest currency unit)
    // For ZAR, multiply by 100 to get cents
    const amountInCents = Math.round(invoice.balance_due * 100);

    // Initialize Paystack payment (using https module with IPv4 to fix DNS issues)
    const requestBody = JSON.stringify({
      email: invoice.company_email,
      amount: amountInCents,
      currency: 'ZAR',
      reference: reference,
      callback_url: `${APP_URL}/billing/invoices/${invoice.id}?payment=callback`,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        company_id: user.company_id,
        payment_id: paymentId,
      },
    });

    const paystackData: PaystackInitializeResponse = await httpsRequest(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      },
      requestBody
    );

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return res.status(400).json({
        success: false,
        error: paystackData.message || 'Payment initialization failed',
      });
    }

    // Create pending payment record
    await query(
      `INSERT INTO payments (
        payment_id, invoice_id, company_id, amount, currency, payment_method,
        paystack_reference, status
      )
      VALUES (@payment_id, @invoice_id, @company_id, @amount, 'ZAR', 'paystack', @reference, 'pending')`,
      [
        { name: 'payment_id', type: sql.NVarChar, value: paymentId },
        { name: 'invoice_id', type: sql.Int, value: invoice.id },
        { name: 'company_id', type: sql.Int, value: user.company_id },
        { name: 'amount', type: sql.Decimal, value: invoice.balance_due },
        { name: 'reference', type: sql.NVarChar, value: reference },
      ]
    );

    return res.status(200).json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        reference: reference,
      },
      message: 'Payment initialized',
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ success: false, error: 'Failed to initialize payment' });
  }
}

export default withAuth(handler);
