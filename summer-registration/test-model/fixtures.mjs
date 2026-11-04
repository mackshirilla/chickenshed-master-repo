// Synthetic fixtures only. Live identifiers are documented separately, never passed to a provider here.
export function fixtures() {
  const price = (key, cents) => ({ price_id: `price_fixture_${key}`, product_id: `prod_fixture_${key}`, cents, currency: 'usd', active: true, type: 'one_time' });
  const deposit = price('deposit', 10000);
  const sessions = [80000, 160000, 220000].map((cents, i) => ({
    id: 64 + i, program_id: 13, name: ['Summer Shed (1 Week)', 'Summer Shed (2 Weeks)', 'Summer Shed (3 Weeks)'][i],
    time: 'Monday–Friday · 9:00 AM–3:00 PM', archived: false, draft: false,
    tuition: price(`tuition_${i + 1}`, cents), deposit
  }));
  return {
    actor: { id: 9001, email: 'family@example.invalid', stripe_customer_id: 'cus_fixture_family' },
    students: [
      { id: 9101, full_name: 'Alex Example', Status: 'Approved', parent_user_id: 9001 },
      { id: 9102, full_name: 'Sam Example', Status: 'Pending', parent_user_id: 9001 },
      { id: 9103, full_name: 'Jamie Example', Status: 'Approved', parent_user_id: 9001 },
      { id: 9104, full_name: 'Archived Example', Status: 'Archived', parent_user_id: 9001 },
      { id: 9201, full_name: 'Other Family', Status: 'Approved', parent_user_id: 9002 }
    ], sessions,
    coupons: [10, 20, 35, 50, 75].map(percent_off => ({ id: `coupon_fixture_summer_${percent_off}`, percent_off, duration: 'once', valid: true, products: sessions.map(row => row.tuition.product_id) }))
  };
}
