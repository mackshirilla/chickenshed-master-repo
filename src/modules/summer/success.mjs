import { transport, dollars, textElement } from './transport.mjs';

export function initializeSummerSuccessPage(){
if(location.hostname!=='www.chickenshednyc.org'||location.pathname!=='/checkout-success/summer-camp-success')return;
const root = document.querySelector('[data-summer-familiar-success]');
if (root) {
  if(root.dataset.summerMounted==='true')return;root.dataset.summerMounted='true';
  let config;try{config=JSON.parse(document.querySelector('#summer-bridge-config')?.textContent||'{}');}catch{}
  if(config?.enabled!==true){root.querySelector('[data-summer-heading]').textContent='Summer order details are not open yet';root.querySelector('#summerOrderNote').textContent='Contact Chickenshed if you need help with a Summer payment.';root.querySelector('#summerOrderRefresh').hidden=true;return;}
  root.dataset.summerApiBase='https://xszy-vp96-kdkh.n7c.xano.io/api:summer26/summer';
  delete root.dataset.summerApiTenant;delete root.dataset.summerDemo;delete root.dataset.summerLocalTest;delete root.dataset.summerTest;
  const heading = root.querySelector('[data-summer-heading]');
  const note = root.querySelector('#summerOrderNote');
  const items = root.querySelector('#summerOrderItems');
  const card = root.querySelector('#successCard');
  // The duplicated card was a subscription-management link. Keep its design,
  // but make it a non-interactive receipt region on this page only.
  card.removeAttribute('href'); card.removeAttribute('tabindex');
  card.addEventListener('click', event => event.preventDefault());
  let refresh = root.querySelector('#summerOrderRefresh');
  if (refresh.tagName !== 'BUTTON') {
    const button = textElement('button', refresh.textContent);
    button.id = refresh.id; button.type = 'button'; refresh.replaceWith(button); refresh = button;
  }
  const field = (id, label, value) => {
    const node = root.querySelector(`#${id}`);
    node.replaceChildren(document.createTextNode(`${label}: `), textElement('strong', value));
  };
  const aidFields = ['financialAidRequested', 'financialAidApplied', 'AmountDiscount'];
  const showAid = visible => aidFields.forEach(id => { root.querySelector(`#${id}`).hidden = !visible; });
  const clear = () => {
    delete root.dataset.summerPaid;
    items.replaceChildren();
    showAid(false);
    for (const [id, label] of Object.entries({status:'Payment',billingCycle:'Students',pendingStudents:'Deposit students',
      financialAidRequested:'Financial aid',financialAidApplied:'Tuition aid',subtotal:'Total tuition',
      depositPaid:'Deposits received',AmountDiscount:'Aid on this payment',subscriptionTotal:'Amount received',dueUponApproval:'Balance remaining'})) {
      field(id, label, id === 'status' ? 'Checking…' : '—');
    }
  };
  let checking = false;
  async function check() {
    if (checking) return;
    checking = true; refresh.disabled = true;
    clear();
    try {
      const sessionId = new URLSearchParams(location.search).get('session_id');
      if (!sessionId) throw new Error('We could not identify this payment. Contact Chickenshed before paying again.');
      const result = await transport(root)(`receipt?session_id=${encodeURIComponent(sessionId)}`);
      if (result.status !== 'paid') {
        heading.textContent = 'Your Summer payment is being checked';
        field('status', 'Payment', result.status === 'review' ? 'Under review' : 'Awaiting confirmation');
        note.textContent = 'Payment has not been confirmed yet. Check again shortly or contact Chickenshed. Please do not pay again.';
        return;
      }
      heading.textContent = 'Your Summer payment is received';
      field('status', 'Payment', 'Confirmed');
      field('billingCycle', 'Students', String(new Set(result.items.map(item => item.student_id)).size));
      const deposits = result.items.filter(item => item.payment_option === 'deposit');
      field('pendingStudents', 'Deposit students', String(new Set(deposits.map(item => item.student_id)).size));
      field('financialAidRequested', 'Financial aid', [...new Set(result.items.map(item => `${item.aid_percent}%`))].join(', '));
      field('financialAidApplied', 'Tuition aid', dollars(result.totals.aid_cents));
      showAid(result.items.some(item => Number(item.aid_percent) > 0));
      field('subtotal', 'Total tuition', dollars(result.totals.tuition_cents));
      field('depositPaid', 'Deposits received', dollars(deposits.reduce((sum, item) => sum + item.paid_cents, 0)));
      field('AmountDiscount', 'Aid on this payment', dollars(result.totals.checkout_discount_cents));
      field('subscriptionTotal', 'Amount received', dollars(result.paid_cents));
      field('dueUponApproval', 'Balance remaining', dollars(result.totals.balance_after_checkout_cents));
      const list = document.createElement('ul');
      for (const item of result.items) {
        const row = document.createElement('li');
        row.append(textElement('strong', `${item.student_name} · ${item.package_name}`));
        row.append(textElement('p', `${item.payment_option === 'deposit' ? 'Deposit received' : 'Full tuition received'}: ${dollars(item.paid_cents)}`));
        if (item.payment_option === 'deposit') row.append(textElement('p', `Balance after this checkout: ${dollars(item.balance_after_checkout_cents)}. Chickenshed will follow up about student review and the remaining payment.`));
        list.append(row);
      }
      items.append(list);
      note.textContent = 'Your Summer registration confirmation will arrive by email. Your Stripe payment receipt is separate.';
      root.dataset.summerPaid = 'true';
      root.querySelector('.success_trigger')?.click();
      refresh.hidden = true;
      sessionStorage.removeItem('summerRegistration:v1');
    } catch (failure) {
      clear(); heading.textContent = 'We could not verify this Summer payment';
      field('status', 'Payment', 'Not verified'); note.textContent = failure.message;
    } finally { checking = false; refresh.disabled = false; }
  }
  refresh.addEventListener('click', check);
  check();
}

}
