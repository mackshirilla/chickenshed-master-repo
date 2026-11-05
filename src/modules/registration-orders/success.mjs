import {installRegistrationStyles} from './styles.mjs';
import { transport, dollars, textElement } from './transport.mjs';

export function initializeRegistrationSuccessPage(){
if(!['www.chickenshednyc.org','127.0.0.1'].includes(location.hostname)||!['/checkout-success/registration-order','/registration-success-preview'].includes(location.pathname))return;
const root = document.querySelector('[data-summer-familiar-success]');
if (root) {
  if(root.dataset.registrationMounted==='true')return;root.dataset.registrationMounted='true';
  let config;try{config=JSON.parse(document.querySelector('#registration-orders-config')?.textContent||'{}');}catch{}
  if(config?.enabled!==true){root.querySelector('[data-summer-heading]').textContent='registration order details are not open yet';root.querySelector('#summerOrderNote').textContent='Contact Chickenshed NYC if you need help with a registration payment.';root.querySelector('#summerOrderRefresh').hidden=true;return;}
  installRegistrationStyles();
  root.dataset.summerApiBase='https://xszy-vp96-kdkh.n7c.xano.io/api:registration26/registration';
  delete root.dataset.summerApiTenant;delete root.dataset.summerDemo;delete root.dataset.summerLocalTest;delete root.dataset.summerTest;
  const heading = root.querySelector('[data-summer-heading]');heading.textContent='Checking your registration payment';
  if(document.title.includes('Summer'))document.title='Registration confirmation | Chickenshed NYC';
  root.setAttribute('aria-label','Registration order details');
  root.querySelectorAll('*').forEach(node=>{if(node.childElementCount)return;if(node.textContent.trim()==='Your Summer Order:')node.textContent='Your registration order:';if(node.textContent.includes('We’re excited to welcome your family to Summer Shed'))node.textContent='We’re excited to welcome your family to Chickenshed NYC. Your confirmed registration and payment details appear above. Chickenshed NYC will follow up about any remaining balance.';});
  root.querySelectorAll('a[href="/summer-camp-registration"]').forEach(a=>a.href=location.hostname==='127.0.0.1'?'/registration-preview':'/program-registration');
  root.querySelectorAll('h4').forEach(h=>{if(h.textContent.includes('Summer Shed'))h.textContent='Your registration';});
  const note = root.querySelector('#summerOrderNote');
  const items = root.querySelector('#summerOrderItems');
  const card = root.querySelector('#successCard');
  card.setAttribute('aria-label','Registration order details');
  const extra=root.querySelector('#summerOrderExtra'),receiptSurface=card.closest('.bento_box');
  if(extra){extra.classList.add('registration-success-extra');if(receiptSurface?.contains(extra))receiptSurface.after(extra);}
  const another=[...root.querySelectorAll('a')].find(a=>a.textContent.trim()==='Register another child');
  if(another){another.classList.add('btn_main_wrap','registration-order-continue');const content=textElement('span','','btn_main_list u-gap-xsmall u-hflex-center-center');content.append(textElement('span','Register another child','btn_main_text u-weight-bold'));another.replaceChildren(content);another.closest('p')?.classList.add('registration-order-actions');}
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
      depositPaid:'Deposits received',AmountDiscount:'Aid on this payment',subscriptionTotal:'Amount received',dueUponApproval:'Balance after registration'})) {
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
      if (!sessionId) throw new Error('We could not identify this payment. Contact Chickenshed NYC before paying again.');
      const result = await transport(root)(`receipt?session_id=${encodeURIComponent(sessionId)}`);
      if (result.status !== 'paid') {
        heading.textContent = 'Your registration payment is being checked';
        field('status', 'Payment', result.status === 'review' ? 'Under review' : 'Awaiting confirmation');
        note.textContent = 'Payment has not been confirmed yet. Check again shortly or contact Chickenshed NYC. Please do not pay again.';
        return;
      }
      heading.textContent = result.paid_cents===0?'Your registration is confirmed':'Your registration payment is received';
      field('status', 'Payment', result.paid_cents===0?'No payment required':'Confirmed');
      field('billingCycle', 'Students', String(new Set(result.items.map(item => item.student_id)).size));
      const deposits = result.items.filter(item => item.payment_option === 'deposit');
      field('pendingStudents', 'Deposit students', String(new Set(deposits.map(item => item.student_id)).size));
      field('financialAidRequested', 'Financial aid', [...new Set(result.items.map(item => `${item.aid_percent}%`))].join(', '));
      field('financialAidApplied', 'Tuition aid', dollars(result.totals.aid_cents));
      showAid(result.items.some(item => Number(item.aid_percent) > 0));
      field('subtotal', result.items.some(i=>i.payment_preference==='semester')?'Tuition in this checkout':'Total tuition', dollars(result.totals.tuition_cents));
      field('depositPaid', 'Deposits received', dollars(deposits.reduce((sum, item) => sum + item.paid_cents, 0)));
      field('AmountDiscount', result.totals.promotion_discount_cents?'Coupon discount':'Aid on this payment', dollars(result.totals.checkout_discount_cents));
      if(result.totals.promotion_discount_cents)root.querySelector('#AmountDiscount').hidden=false;
      field('subscriptionTotal', 'Amount received', dollars(result.paid_cents));
      field('dueUponApproval', result.items.some(i=>i.payment_preference==='semester')?'Balance on this order':'Balance after registration', dollars(result.totals.balance_after_checkout_cents));
      const list = document.createElement('ul');
      for (const item of result.items) {
        const row = document.createElement('li');row.className='bento_box registration-success-item';
        row.append(textElement('strong', `${item.student_name} · ${item.package_name}`));
        if(item.coverage_label)row.append(textElement('p',item.coverage_label));
        row.append(textElement('p', `${item.payment_option === 'deposit' ? 'Deposit received' : item.tuition_period==='semester'?'Semester tuition received':'Tuition received'}: ${dollars(item.paid_cents)}`));
        if(item.promotion_discount_cents)row.append(textElement('p', `Coupon applied: ${dollars(item.promotion_discount_cents)}`));
        if (item.payment_option === 'deposit') row.append(textElement('p', `Balance after this checkout: ${dollars(item.balance_after_checkout_cents)}. ${item.student_status==='Pending'?'Chickenshed NYC will follow up about student review and the remaining payment.':'Chickenshed NYC will contact you to arrange monthly payments.'}`));
        list.append(row);
      }
      items.append(list);
      if(result.items.some(i=>i.payment_preference==='semester'))items.append(textElement('p','You selected pay per semester. Chickenshed NYC will contact you about any remaining or later semester payments. The balance on this order does not include future semester payments.'));
      if(result.items.some(i=>i.payment_preference==='monthly'))items.append(textElement('p','Your deposit is confirmed. Chickenshed NYC will contact you to arrange monthly payments.'));
      note.textContent = result.paid_cents===0?'No payment was required. Your registration confirmation will arrive by email.':'Your registration confirmation will arrive by email. Your Stripe payment receipt is separate.';
      root.dataset.summerPaid = 'true';
      root.querySelector('.success_trigger')?.click();
      refresh.hidden = true;
      sessionStorage.removeItem('registrationOrders:v2');
    } catch (failure) {
      clear(); heading.textContent = 'We could not verify this registration payment';
      field('status', 'Payment', 'Not verified'); note.textContent = failure.message;
    } finally { checking = false; refresh.disabled = false; }
  }
  refresh.addEventListener('click', check);
  check();
}

}
