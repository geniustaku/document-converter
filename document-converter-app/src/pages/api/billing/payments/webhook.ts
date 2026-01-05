// pages/api/billing/payments/webhook.ts - Paystack webhook handler
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { query, sql } from '@/lib/db';
import type { PaystackWebhookEvent } from '@/types/billing';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export const config = {
  api: {
    bodyParser: true, // Keep body parser for webhook
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'] as string;
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event: PaystackWebhookEvent = req.body;

    console.log('Paystack webhook received:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event);
        break;
      case 'charge.failed':
        await handleFailedCharge(event);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSuccessfulCharge(event: PaystackWebhookEvent) {
  const { reference, amount, status, channel } = event.data;

  // Get payment record
  const paymentResult = await query<any>(
    `SELECT p.*, i.id as invoice_id FROM payments p
     INNER JOIN invoices i ON p.invoice_id = i.id
     WHERE p.paystack_reference = @reference`,
    [{ name: 'reference', type: sql.NVarChar, value: reference }]
  );

  if (paymentResult.recordset.length === 0) {
    console.error('Payment not found for webhook reference:', reference);
    return;
  }

  const payment = paymentResult.recordset[0];

  // Skip if already processed
  if (payment.status === 'success') {
    console.log('Payment already processed:', reference);
    return;
  }

  // Update payment
  await query(
    `UPDATE payments SET
      status = 'success',
      paystack_status = @status,
      paystack_channel = @channel,
      paystack_response = @response,
      processed_at = GETUTCDATE()
     WHERE id = @id`,
    [
      { name: 'status', type: sql.NVarChar, value: status },
      { name: 'channel', type: sql.NVarChar, value: channel },
      { name: 'response', type: sql.NVarChar, value: JSON.stringify(event.data) },
      { name: 'id', type: sql.Int, value: payment.id },
    ]
  );

  // Update invoice
  const amountPaid = amount / 100;
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
      { name: 'invoice_id', type: sql.Int, value: payment.invoice_id },
    ]
  );

  // Log audit
  await query(
    `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, new_values)
     VALUES ('payment_webhook', 'payment', @entity_id, 'system', 'paystack', @new_values)`,
    [
      { name: 'entity_id', type: sql.NVarChar, value: payment.payment_id },
      { name: 'new_values', type: sql.NVarChar, value: JSON.stringify({ amount: amountPaid, reference, status: 'success' }) },
    ]
  );

  console.log('Payment processed via webhook:', reference);
}

async function handleFailedCharge(event: PaystackWebhookEvent) {
  const { reference, status } = event.data;

  // Update payment as failed
  await query(
    `UPDATE payments SET
      status = 'failed',
      paystack_status = @status,
      paystack_response = @response
     WHERE paystack_reference = @reference`,
    [
      { name: 'status', type: sql.NVarChar, value: status },
      { name: 'response', type: sql.NVarChar, value: JSON.stringify(event.data) },
      { name: 'reference', type: sql.NVarChar, value: reference },
    ]
  );

  console.log('Payment marked as failed via webhook:', reference);
}
