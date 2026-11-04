import { randomUUID } from 'node:crypto';
import { quoteFamily, quoteIdentity, validateAidIntake, requireValue, POLICY } from './quote.mjs';
import { verifyEvent } from './signature.mjs';

export class SummerService {
  constructor({ repository, stripe, catalog, origin, webhookSecret, clock = () => Date.now() }) {
    this.repository = repository; this.stripe = stripe; this.catalog = catalog;
    this.origin = new URL(origin).origin; this.webhookSecret = webhookSecret; this.clock = clock;
    // This candidate is isolated and cannot opt into live payment processing.
    requireValue(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'ENVIRONMENT', 'Only local preview is configured.', 503);
  }
  context(actor) { requireValue(actor?.id, 'UNAUTHORIZED', 'Please sign in.', 401); return { ...this.catalog, actorId: actor.id }; }
  start(actor) {
    this.context(actor);
    return {
      students: this.catalog.students.filter(row => row.parent_user_id === actor.id && ['Pending', 'Approved'].includes(row.Status)).map(({ id, full_name, Status }) => ({ id, full_name, Status })),
      sessions: this.catalog.sessions.filter(row => row.program_id === 13 && !row.draft && !row.archived).map(row => ({ id: row.id, name: row.name, time: row.time })),
      aid_rates: [10, 20, 35, 50, 75]
    };
  }
  quote(actor, request) { return quoteFamily(request, this.context(actor)); }
  async checkout(actor, request) {
    this.context(actor);
    requireValue(typeof request.attempt_id === 'string' && /^[a-zA-Z0-9_-]{16,80}$/.test(request.attempt_id), 'ATTEMPT_REQUIRED', 'Refresh the registration form and try again.');
    return this.repository.locked(async state => {
      let order = state.orders.find(row => row.owner_id === actor.id && row.attempt_id === request.attempt_id);
      if (order?.status === 'paid') return this.result(order);
      const quote = this.quote(actor, request);
      const fingerprint = quoteIdentity(quote);
      requireValue(request.quote_fingerprint === fingerprint, 'QUOTE_CHANGED', 'Your registration price changed. Review the updated payment before continuing.', 409);
      const intake = validateAidIntake(quote.aid_percent, request.aid_data);
      requireValue(!(order?.status === 'creating' && !order.checkout_session_id && order.fingerprint !== fingerprint),
        'CHECKOUT_IN_PROGRESS', 'Your previous checkout is still being prepared. Retry the same selection before changing it.', 409);
      if (order?.checkout_session_id) {
        const previous = await this.stripe.retrieve(order.checkout_session_id);
        if (previous.payment_status === 'paid') { this.applyPaid(order, previous); return this.result(order); }
        requireValue(previous.status !== 'complete', 'PAYMENT_PENDING', 'Your payment is still being checked. Please do not pay again; contact Chickenshed if you need help.', 409);
        if (order.fingerprint === fingerprint && previous.status === 'open' && previous.expires_at > Math.floor(this.clock() / 1000)) return this.result(order);
        if (previous.status === 'open') {
          try { await this.stripe.expire(previous.id); }
          catch {
            const latest = await this.stripe.retrieve(previous.id);
            if (latest.payment_status === 'paid') { this.applyPaid(order, latest); return this.result(order); }
            throw new Error('Could not retire the previous checkout. Please contact Chickenshed before trying again.');
          }
        }
        order.previous_checkouts.push({ session_id: previous.id, version: order.version, quote: order.quote });
        order.version++;
      }
      if (!order) {
        order = { id: randomUUID(), owner_id: actor.id, attempt_id: request.attempt_id, version: 1, previous_checkouts: [], created_at: new Date(this.clock()).toISOString() };
        state.orders.push(order);
      }
      Object.assign(order, { status: 'creating', quote, fingerprint, aid_data: intake, payer_email: actor.email,
        stripe_customer_id: actor.stripe_customer_id || null, paid_cents: 0, paid_at: null, payment_intent_id: null, handled: false });
      const metadata = { checkout_policy: POLICY, order_id: order.id, quote_version: String(order.version) };
      const payload = {
        mode: 'payment', line_items: quote.lines.map(({ price, quantity }) => ({ price, quantity })),
        metadata, payment_intent_data: { metadata, receipt_email: actor.email },
        success_url: `${this.origin}/checkout-success/summer?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.origin}/summer-registration`, expires_at: Math.floor(this.clock() / 1000) + 1800,
        integration_identifier: `summer_bridge_${randomUUID().replace(/-/g, '').slice(0, 8)}`
      };
      if (actor.stripe_customer_id) payload.customer = actor.stripe_customer_id; else payload.customer_email = actor.email;
      if (quote.coupon_id) payload.discounts = [{ coupon: quote.coupon_id }];
      // No invoice creation, subscription, card storage, promotion-code input or shared aid coupon.
      const session = await this.stripe.create(payload, `${order.id}:${order.version}`, quote);
      requireValue(session.livemode === false && session.mode === 'payment', 'ENVIRONMENT', 'Unexpected payment environment.', 503);
      Object.assign(order, { checkout_session_id: session.id, checkout_url: session.url, status: 'pending' });
      this.validateSession(order, session);
      return this.result(order);
    });
  }
  result(order) {
    return { order_id: order.id, status: order.status, url: order.status === 'paid' ?
      `${this.origin}/checkout-success/summer?session_id=${encodeURIComponent(order.checkout_session_id)}` : order.checkout_url };
  }
  validateSession(order, session) {
    requireValue(session.livemode === false && session.mode === 'payment' && session.currency === 'usd' &&
      session.id === order.checkout_session_id && session.metadata?.checkout_policy === POLICY &&
      session.metadata.order_id === order.id && session.metadata.quote_version === String(order.version) &&
      session.customer === order.stripe_customer_id, 'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    requireValue(session.amount_total === order.quote.totals.due_now_cents && session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details?.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const normalize = lines => lines.map(line => ({ price: line.price, product: line.product, quantity: line.quantity,
      amount_subtotal: line.amount_subtotal, amount_discount: line.amount_discount, amount_total: line.amount_total })).sort((a, b) => a.price.localeCompare(b.price));
    requireValue(JSON.stringify(normalize(session.line_items)) === JSON.stringify(normalize(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  applyPaid(order, session) {
    try { this.validateSession(order, session); }
    catch (error) {
      if (session.payment_status === 'paid') Object.assign(order, { status: 'review', observed_payment_cents: session.amount_total,
        observed_payment_intent_id: session.payment_intent, review_reason: error.code || 'PAYMENT_MISMATCH' });
      throw error;
    }
    requireValue(session.payment_status === 'paid' && session.status === 'complete' && session.payment_intent,
      'PAYMENT_PENDING', 'Payment is still processing.', 409);
    if (order.status === 'paid') return false;
    order.status = 'paid'; order.paid_cents = session.amount_total; order.payment_intent_id = session.payment_intent;
    order.paid_at = new Date(this.clock()).toISOString();
    order.quote.items.forEach(item => { item.paid_cents = item.due_now_cents; });
    return true;
  }
  async webhook(rawBody, signature) {
    const event = verifyEvent(rawBody, signature, this.webhookSecret, Math.floor(this.clock() / 1000));
    requireValue(event.livemode === false, 'ENVIRONMENT', 'Wrong payment environment.', 400);
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) return { ignored: true };
    return this.repository.locked(async state => {
      const session = await this.stripe.retrieve(event.data.object.id);
      if (session.metadata?.checkout_policy !== POLICY) return { ignored: true };
      const order = state.orders.find(row => row.id === session.metadata.order_id);
      requireValue(order, 'ORDER_NOT_READY', 'Order not ready; retry event.', 409);
      // Retired unpaid Sessions cannot affect the new quote; a paid retired Session is a reconciliation error.
      if (session.id !== order.checkout_session_id) {
        requireValue(session.payment_status !== 'paid', 'PAYMENT_MISMATCH', 'Retired checkout requires staff review.', 409);
        return { ignored: true };
      }
      if (session.payment_status === 'paid') return { applied: this.applyPaid(order, session) };
      this.validateSession(order, session);
      if (order.status !== 'paid' && session.status === 'expired') order.status = 'expired';
      return { applied: false, status: order.status };
    });
  }
  async receipt(actor, sessionId) {
    this.context(actor);
    return this.repository.locked(state => {
      const order = state.orders.find(row => row.owner_id === actor.id && row.checkout_session_id === sessionId);
      requireValue(order, 'NOT_FOUND', 'We could not find this payment. Contact Chickenshed before paying again.', 404);
      return { order_id: order.id, status: order.status, paid_cents: order.paid_cents, items: structuredClone(order.quote.items), totals: order.quote.totals };
    });
  }
  async staff(actor) {
    requireValue(actor?.role === 'staff', 'FORBIDDEN', 'Staff access required.', 403);
    return this.repository.locked(state => state.orders.filter(order => ['paid','review'].includes(order.status)).map(order => ({
      order_id: order.id, status: order.status, review_reason: order.review_reason || null, observed_payment_cents: order.observed_payment_cents ?? null,
      paid_at: order.paid_at, paid_cents: order.paid_cents, items: order.quote.items,
      totals: order.quote.totals, payment_intent_id: order.payment_intent_id, handled: order.handled, staff_notes:order.staff_notes||''
    })));
  }
  async staffUpdate(actor,input) {
    requireValue(actor?.role==='staff','FORBIDDEN','Staff access required.',403);
    requireValue(typeof input.handled==='boolean'&&typeof input.staff_notes==='string'&&input.staff_notes.length<=2000,
      'STAFF_FIELDS','Review the handled status and notes.',400);
    return this.repository.locked(state=>{
      const order=state.orders.find(o=>o.id===input.order_id&&['paid','review'].includes(o.status));
      requireValue(order,'NOT_FOUND','Order not found.',404);
      Object.assign(order,{handled:input.handled,staff_notes:input.staff_notes});
      return {order_id:order.id,handled:order.handled,staff_notes:order.staff_notes};
    });
  }
}
