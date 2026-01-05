// pages/api/billing/payments/verify.ts - Verify Paystack payment
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, PaystackVerifyResponse } from '@/types/billing';
import https from 'https';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// Helper function to make HTTPS GET requests (fixes Node.js 18+ IPv6 DNS issues)
async function httpsGet(url: string, headers: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers, family: 4 }, (res) => {
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
    req.end();
  });
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ status: string; invoice_status: string }>>,
  user: AuthUser
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Payment reference is required' });
    }

    // Verify payment with Paystack (using https module with IPv4 to fix DNS issues)
    const paystackData: PaystackVerifyResponse = await httpsGet(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` }
    );

    if (!paystackData.status) {
      return res.status(400).json({
        success: false,
        error: paystackData.message || 'Payment verification failed',
      });
    }

    const transactionData = paystackData.data;

    // Get payment record
    const paymentResult = await query<any>(
      `SELECT p.*, i.id as invoice_id, i.invoice_number, i.balance_due
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE p.paystack_reference = @reference AND p.company_id = @company_id`,
      [
        { name: 'reference', type: sql.NVarChar, value: reference },
        { name: 'company_id', type: sql.Int, value: user.company_id },
      ]
    );

    if (paymentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const payment = paymentResult.recordset[0];

    // Only process if payment was successful
    if (transactionData.status === 'success') {
      // Update payment record
      await query(
        `UPDATE payments SET
          status = 'success',
          paystack_transaction_id = @transaction_id,
          paystack_status = @paystack_status,
          paystack_channel = @channel,
          paystack_response = @response,
          processed_at = GETUTCDATE()
         WHERE id = @id`,
        [
          { name: 'transaction_id', type: sql.NVarChar, value: transactionData.id.toString() },
          { name: 'paystack_status', type: sql.NVarChar, value: transactionData.status },
          { name: 'channel', type: sql.NVarChar, value: transactionData.channel },
          { name: 'response', type: sql.NVarChar, value: JSON.stringify(transactionData) },
          { name: 'id', type: sql.Int, value: payment.id },
        ]
      );

      // Update invoice
      const amountPaid = transactionData.amount / 100; // Convert from cents
      const invoiceId = parseInt(payment.invoice_id, 10); // Ensure it's a number
      await query(
        `UPDATE invoices SET
          amount_paid = amount_paid + @amount_paid,
          balance_due = balance_due - @amount_paid,
          status = CASE WHEN balance_due - @amount_paid <= 0 THEN 'paid' ELSE 'partially_paid' END,
          payment_date = CASE WHEN balance_due - @amount_paid <= 0 THEN GETUTCDATE() ELSE payment_date END,
          payment_method = 'paystack',
          payment_reference = @reference,
          paystack_reference = @reference,
          updated_at = GETUTCDATE()
         WHERE id = @invoice_id`,
        [
          { name: 'amount_paid', type: sql.Decimal, value: amountPaid },
          { name: 'reference', type: sql.NVarChar, value: reference },
          { name: 'invoice_id', type: sql.Int, value: invoiceId },
        ]
      );

      // Log audit
      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, new_values)
         VALUES ('payment_received', 'invoice', @entity_id, 'user', @actor_id, @actor_email, @new_values)`,
        [
          { name: 'entity_id', type: sql.NVarChar, value: payment.invoice_number },
          { name: 'actor_id', type: sql.NVarChar, value: user.user_id },
          { name: 'actor_email', type: sql.NVarChar, value: user.email },
          { name: 'new_values', type: sql.NVarChar, value: JSON.stringify({ amount: amountPaid, reference }) },
        ]
      );

      // Get updated invoice status
      const invoiceResult = await query<{ status: string }>(
        `SELECT status FROM invoices WHERE id = @invoice_id`,
        [{ name: 'invoice_id', type: sql.Int, value: invoiceId }]
      );

      return res.status(200).json({
        success: true,
        data: {
          status: 'success',
          invoice_status: invoiceResult.recordset[0]?.status || 'paid',
        },
        message: 'Payment verified successfully',
      });
    } else {
      // Update payment as failed
      await query(
        `UPDATE payments SET
          status = 'failed',
          paystack_status = @paystack_status,
          paystack_response = @response
         WHERE id = @id`,
        [
          { name: 'paystack_status', type: sql.NVarChar, value: transactionData.status },
          { name: 'response', type: sql.NVarChar, value: JSON.stringify(transactionData) },
          { name: 'id', type: sql.Int, value: payment.id },
        ]
      );

      return res.status(200).json({
        success: true,
        data: {
          status: 'failed',
          invoice_status: 'pending',
        },
        message: 'Payment was not successful',
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
}

export default withAuth(handler);
