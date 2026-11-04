import {POLICY, requireValue} from './quote.mjs';

// Payment stays on the order; these rows are staff-managed placements.
export function planSessionRegistrations(order, existing, catalog) {
  if (order?.status !== 'paid') return {create:[], reused:0};
  const id = value => Number.isSafeInteger(value) && value > 0;
  requireValue(id(order.id) && id(order.owner_user_id) && order.checkout_policy === POLICY &&
    typeof order.checkout_session_id === 'string' && order.checkout_session_id.length > 0 &&
    order.quote?.policy === POLICY && Array.isArray(order.quote.items) && order.quote.items.length > 0 &&
    order.paid_cents === order.quote.totals?.due_now_cents,
  'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
  const key = row => `${row.student_id}:${row.session_id}`;
  const expected = new Set(order.quote.items.map(key));
  requireValue(expected.size === order.quote.items.length && Array.isArray(existing),
    'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
  const found = new Set();
  for (const row of existing) {
    requireValue(row.registration_order_id === order.id && row.parent_user_id === order.owner_user_id &&
      row.program_id === 13 && !row.subscription_id && row.checkout_session_id === order.checkout_session_id &&
      expected.has(key(row)) && !found.has(key(row)),
    'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
    found.add(key(row));
  }
  const optionalId = value => id(value) ? value : null;
  const create = [];
  for (const item of order.quote.items) {
    requireValue(id(item.student_id) && id(item.session_id) && item.program_id === 13 &&
      item.paid_cents === item.due_now_cents,
    'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
    // A replay must leave staff changes and existing placement details intact.
    if (found.has(key(item))) continue;
    const student = catalog.students.find(row => row.id === item.student_id && row.parent_user_id === order.owner_user_id);
    const session = catalog.sessions.find(row => row.id === item.session_id && row.Parent_program === 13);
    requireValue(student && session && id(session.Tuition_product),
      'REGISTRATION_LINK', 'A Summer student or session needs staff review.', 409);
    const workshop = catalog.workshops.find(row => row.id === session.Parent_workshop);
    const location = catalog.locations.find(row => row.id === session.Location);
    create.push({
      registration_order_id:order.id, status:'Pending', update_status:'Pending',
      student_id:item.student_id, parent_user_id:order.owner_user_id, session_id:item.session_id,
      program_id:13, program_name:'Summer Shed', subscription_id:null,
      workshop_id:optionalId(session.Parent_workshop), workshop_name:workshop?.Name || '',
      weekday:session.Weekday || '', time_block:session.Time_block || '',
      location_id:optionalId(session.Location), location:location?.Name || '',
      product_id:session.Tuition_product, update_product_id:session.Tuition_product,
      checkout_session_id:order.checkout_session_id, move_to:null
    });
  }
  return {create, reused:found.size};
}
