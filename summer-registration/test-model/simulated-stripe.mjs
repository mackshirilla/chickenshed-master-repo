import { randomUUID } from 'node:crypto';
// Deliberately no network implementation or Stripe key support in this preview provider.
export class SimulatedStripe {
  constructor(state) { this.state = state; this.createCalls = 0; }
  async create(payload, key, quote) {
    const reused = Object.values(this.state.sessions).find(session => session.idempotency_key === key);
    if (reused) return structuredClone(reused);
    this.createCalls++;
    const id = `cs_test_fixture_${randomUUID()}`;
    const session = {
      id, mode: 'payment', livemode: false, currency: 'usd', status: 'open', payment_status: 'unpaid',
      metadata: payload.metadata, customer: payload.customer || null,
      amount_subtotal: quote.totals.checkout_gross_cents, amount_total: quote.totals.due_now_cents,
      total_details: { amount_discount: quote.totals.checkout_discount_cents },
      line_items: quote.lines.map(line => ({ ...line })), idempotency_key: key,
      url: `/simulated-checkout/${id}`, success_url: payload.success_url, cancel_url: payload.cancel_url,
      expires_at: payload.expires_at, payment_intent: null, payload: structuredClone(payload)
    };
    this.state.sessions[id] = session;
    return structuredClone(session);
  }
  async retrieve(id) { const value = this.state.sessions[id]; if (!value) throw new Error('Session unavailable.'); return structuredClone(value); }
  async expire(id) {
    const session = this.state.sessions[id];
    if (!session || session.payment_status === 'paid') throw new Error('Cannot expire this Session.');
    session.status = 'expired'; return structuredClone(session);
  }
  paidFixture(id) {
    const session = this.state.sessions[id];
    if (!session || session.status === 'expired') throw new Error('Session unavailable.');
    session.status = 'complete'; session.payment_status = 'paid'; session.payment_intent ||= `pi_fixture_${randomUUID()}`;
    return { id: `evt_fixture_${randomUUID()}`, type: 'checkout.session.completed', livemode: false, data: { object: { id } } };
  }
}
