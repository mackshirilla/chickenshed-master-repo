// Pure helper only. No database, credentials, payments, or deployment performed.
function "summer_live_quote_v1" {
  input {
    json request
    json context
  }
  stack {
    function.run summer_live_guard_v1 { input = {} } as $live_guard
    api.lambda {
      code = """
        const POLICY = 'summer_family_v1';
        const AID_RATES = Object.freeze([0, 10, 20, 35, 50, 75]);
        class SummerError extends Error {
          constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
        }
        function requireValue(condition, code, message, status = 400) {
          if (!condition) throw new SummerError(code, message, status);
        }
        const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
        function quoteFamily(request, { actorId, students, sessions, coupons }) {
          requireValue(Array.isArray(request.items) && request.items.length > 0 && request.items.length <= 30,
            'ITEMS_REQUIRED', 'Add at least one child and package.');
          const aidPercent = Number(request.aid_percent ?? 0);
          requireValue(AID_RATES.includes(aidPercent), 'INVALID_AID', 'Choose an available financial aid percentage.');
          const seen = new Set();
          const items = request.items.map(input => {
            requireValue(positiveId(input.student_id) && positiveId(input.session_id), 'INVALID_ITEM', 'Select a child and package for every row.');
            const studentId = Number(input.student_id), sessionId = Number(input.session_id);
            const student = students.find(row => row.id === studentId && row.parent_user_id === actorId);
            requireValue(student && student.Status !== 'Archived', 'STUDENT_UNAVAILABLE', 'A selected student is unavailable.', 403);
            requireValue(['Pending', 'Approved'].includes(student.Status), 'STUDENT_STATUS', 'Please contact Chickenshed about this student’s profile.');
            const session = sessions.find(row => row.id === sessionId && row.program_id === 13 && !row.draft && !row.archived);
            requireValue(session, 'SESSION_UNAVAILABLE', 'A selected summer package is unavailable.');
            const key = `${studentId}:${sessionId}`;
            requireValue(!seen.has(key), 'DUPLICATE_ITEM', 'This child and package are already in your registration.');
            seen.add(key);
            for (const product of [session.tuition, session.deposit]) {
              requireValue(product?.price_id && product?.product_id && Number.isSafeInteger(product.cents) && product.cents > 0 &&
                product.active === true && product.currency === 'usd' && product.type === 'one_time', 'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
            }
            requireValue(session.deposit.cents === 10000 && session.tuition.product_id !== session.deposit.product_id,
              'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
            const tuitionCents = session.tuition.cents;
            const aidCents = Math.round(tuitionCents * aidPercent / 100);
            const netCents = tuitionCents - aidCents;
            const option = student.Status === 'Pending' ? 'deposit' : 'full';
            const grossDueCents = option === 'deposit' ? session.deposit.cents : tuitionCents;
            const checkoutDiscountCents = option === 'full' ? aidCents : 0;
            const dueCents = grossDueCents - checkoutDiscountCents;
            requireValue(netCents >= dueCents, 'CATALOG_INVALID', 'Please contact Chickenshed about this package.', 503);
            return {
              student_id: studentId, student_name: student.full_name, student_status: student.Status,
              session_id: sessionId, package_name: session.name, program_id: 13,
              tuition_product: session.tuition.product_id, tuition_price: session.tuition.price_id,
              deposit_product: session.deposit.product_id, deposit_price: session.deposit.price_id,
              payment_option: option, aid_percent: aidPercent, tuition_cents: tuitionCents, aid_cents: aidCents,
              net_tuition_cents: netCents, checkout_gross_cents: grossDueCents,
              checkout_discount_cents: checkoutDiscountCents, due_now_cents: dueCents,
              paid_cents: 0, balance_after_checkout_cents: netCents - dueCents,
              charge_price: option === 'deposit' ? session.deposit.price_id : session.tuition.price_id,
              charge_product: option === 'deposit' ? session.deposit.product_id : session.tuition.product_id
            };
          }).sort((a, b) => a.student_id - b.student_id || a.session_id - b.session_id);
          const sum = field => items.reduce((total, row) => total + row[field], 0);
          const totals = {
            tuition_cents: sum('tuition_cents'), aid_cents: sum('aid_cents'), net_tuition_cents: sum('net_tuition_cents'),
            checkout_gross_cents: sum('checkout_gross_cents'), checkout_discount_cents: sum('checkout_discount_cents'),
            due_now_cents: sum('due_now_cents'), balance_after_checkout_cents: sum('balance_after_checkout_cents')
          };
          const lines = new Map();
          for (const row of items) {
            const line = lines.get(row.charge_price) || { price: row.charge_price, product: row.charge_product, quantity: 0, amount_subtotal: 0, amount_discount: 0, amount_total: 0 };
            line.quantity++; line.amount_subtotal += row.checkout_gross_cents;
            line.amount_discount += row.checkout_discount_cents; line.amount_total += row.due_now_cents;
            lines.set(line.price, line);
          }
          let couponId = null;
          if (totals.checkout_discount_cents > 0) {
            const coupon = coupons.find(row => row.percent_off === aidPercent);
            const tuitionProducts = [...new Set(sessions.map(row => row.tuition.product_id))].sort();
            requireValue(coupon?.valid && coupon.duration === 'once' && Array.isArray(coupon.products) &&
              JSON.stringify([...coupon.products].sort()) === JSON.stringify(tuitionProducts),
            'AID_UNAVAILABLE', 'Financial aid pricing is temporarily unavailable.', 503);
            couponId = coupon.id;
          }
          return { policy: POLICY, currency: 'usd', aid_percent: aidPercent, items, totals,
            lines: [...lines.values()].sort((a, b) => a.price.localeCompare(b.price)), coupon_id: couponId };
        }
        
        function quoteIdentity(quote) {
          // Explicit field order survives JSON key reordering by Xano and HTTP serializers.
          return JSON.stringify({ policy: quote.policy, coupon: quote.coupon_id,
            items: quote.items.map(item => [item.student_id, item.session_id, item.student_status,
              item.tuition_price, item.deposit_price, item.payment_option, item.aid_percent,
              item.tuition_cents, item.aid_cents, item.net_tuition_cents, item.checkout_gross_cents,
              item.checkout_discount_cents, item.due_now_cents, item.balance_after_checkout_cents]),
            totals: ['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(key => quote.totals[key]) });
        }
        
        function validateAidIntake(percent, input) {
          if (percent === 0) return null;
          const data = input || {};
          requireValue(['Parent', 'Guardian', 'Self', 'Other'].includes(data.relationship), 'AID_DETAILS', 'Please complete your financial aid details.');
          const dollars = value => Number(String(value ?? '').replace(/,/g, ''));
          requireValue(String(data.annualIncome ?? '').trim() !== '' && String(data.monthlyExpense ?? '').trim() !== '' &&
            Number.isFinite(dollars(data.annualIncome)) && dollars(data.annualIncome) >= 0 &&
            Number.isFinite(dollars(data.monthlyExpense)) && dollars(data.monthlyExpense) >= 0 &&
            ['Yes', 'No'].includes(data.previousParticipant), 'AID_DETAILS', 'Please complete your financial aid details.');
          return { relationship: data.relationship, annualIncome: dollars(data.annualIncome), monthlyExpense: dollars(data.monthlyExpense), previousParticipant: data.previousParticipant };
        }
        
        return quoteFamily($input.request, $input.context);
        """
      timeout = 10
    } as $quote
  }
  response = $quote
}
