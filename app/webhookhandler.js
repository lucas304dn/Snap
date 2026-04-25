import { supabase } from './supabase.js'

const SNAP_WINDOW_MS = 5 * 60 * 1000

/**
 * Handles real bunq webhook POSTs.
 * bunq sends the payload as `{ NotificationUrl: { category, object: {...} } }`.
 */
export async function handleBunqWebhook(req, res) {
  // Always ACK fast — bunq retries aggressively if you don't.
  res.status(200).send()

  try {
    const notification = req.body?.NotificationUrl
    if (!notification) return

    const category = notification.category
    if (!['PAYMENT', 'MUTATION', 'CARD_TRANSACTION_SUCCESSFUL'].includes(category)) {
      console.log(`[webhook] ignoring category=${category}`)
      return
    }

    const payment =
      notification.object?.Payment ||
      notification.object?.MasterCardAction ||
      notification.object?.Mutation?.Payment ||
      null
    if (!payment) {
      console.log('[webhook] no payment object found')
      return
    }

    const amount = parseFloat(payment.amount?.value || 0)
    // bunq sends negative for outgoing — we want absolute value
    const absAmount = Math.abs(amount)
    if (absAmount === 0) return

    const merchant =
      payment.counterparty_alias?.display_name ||
      payment.counterparty_alias?.label_user?.display_name ||
      payment.description ||
      'Unknown merchant'

    const tx = await insertTransaction({
      bunqPaymentId: String(payment.id || ''),
      amount: absAmount,
      currency: payment.amount?.currency || 'EUR',
      merchant
    })

    console.log(`[webhook] 💳 ${tx?.merchant} €${tx?.amount} → snap by ${tx?.snap_deadline}`)
  } catch (err) {
    console.error('[webhook] error:', err.message)
  }
}

/**
 * Simulator endpoint — fires a fake transaction without needing real bunq.
 * This is what the demo control panel calls.
 */
export async function handleSimulate(req, res) {
  try {
    const { merchant = 'Test Merchant', amount = 9.99, currency = 'EUR', user_id } = req.body || {}

    const tx = await insertTransaction({
      bunqPaymentId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      amount: parseFloat(amount),
      currency,
      merchant,
      userId: user_id || process.env.DEMO_USER_ID
    })

    if (!tx) {
      return res.status(500).json({ error: 'Insert returned no row — check Supabase keys & RLS' })
    }

    console.log(`[simulate] 🧪 ${tx.merchant} €${tx.amount}`)
    res.json({ status: 'ok', transaction: tx })
  } catch (err) {
    console.error('[simulate] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

/** Shared insert logic. */
async function insertTransaction({ bunqPaymentId, amount, currency, merchant, userId }) {
  const sb = supabase()
  const snap_deadline = new Date(Date.now() + SNAP_WINDOW_MS).toISOString()

  const row = {
    bunq_payment_id: bunqPaymentId,
    amount,
    currency,
    merchant,
    snap_deadline,
    user_id: userId || process.env.DEMO_USER_ID
  }

  const { data, error } = await sb
    .from('transactions')
    .upsert(row, { onConflict: 'bunq_payment_id' })
    .select()
    .single()

  if (error) {
    console.error('[insert] supabase error:', error.message)
    return null
  }
  return data
}