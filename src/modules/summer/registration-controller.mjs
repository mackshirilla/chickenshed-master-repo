import { transport, dollars, textElement } from './transport.mjs';
import { quoteIdentity } from './quote.mjs';
export async function initializeSummerRegistration(root) {
  const KEY = 'summerRegistration:v1';
  const error = root.querySelector('#registration_checkout_error');
  const quoteNode = root.querySelector('#summerQuote');
  const priceStatus=root.querySelector('#summerPriceStatus')||textElement('p','','summer-price-status');
  priceStatus.id='summerPriceStatus';priceStatus.setAttribute('role','status');priceStatus.setAttribute('aria-live','polite');priceStatus.setAttribute('aria-atomic','true');
  if(!priceStatus.parentElement)quoteNode.before(priceStatus);
  quoteNode.removeAttribute('aria-live');quoteNode.setAttribute('role','region');quoteNode.setAttribute('aria-label','Order summary');
  function status(message,kind='ready'){
    priceStatus.replaceChildren();priceStatus.hidden=!message;priceStatus.dataset.state=kind;
    if(kind==='loading'){const spinner=textElement('span','','summer-price-spinner');spinner.setAttribute('aria-hidden','true');priceStatus.append(spinner);}
    priceStatus.append(textElement('span',message));quoteNode.setAttribute('aria-busy',String(kind==='loading'));quoteNode.classList.toggle('is-updating',kind==='loading');
  }
  status('Loading your registration…','loading');
  try {
    const api = transport(root), catalog = await api('start');
    if (!catalog.students.length) {
      const message = 'Add a student profile before registering. If your existing profiles are unavailable, contact Chickenshed.';
      error.textContent = message;
      status('A student profile is required.');
      root.querySelector('#subscription_items_list').replaceChildren();
      quoteNode.replaceChildren(textElement('p', message));
      root.querySelector('#submit_registration_checkout').disabled = true;
      root.querySelector('#add_subscription_item').disabled = true;
      root.querySelector('#requestFinAid').disabled = true;
      const actionRequired = root.querySelector('#actionRequiredDialog');
      if (actionRequired) {
        actionRequired.hidden = false; actionRequired.style.removeProperty('display');
        actionRequired.showModal();
        root.querySelector('#alertDialogAnimationTrigger')?.click();
      }
      return;
    }
    let state;
    try { state = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { /* invalid draft resets */ }
    if (!state || !Array.isArray(state.items)) state = { items: [], aid_percent: 0, aid_data: null, attempt_id: crypto.randomUUID() };
    if (!state.items.length) state.items.push({ student_id: '', session_id: '' });
    let quote = null, lastQuote=null, version = 0, submitting = false, updating=false, quoteFailure=false;
    const editing=new Set();
    const list = root.querySelector('#subscription_items_list');
    const summaryCard=quoteNode.closest('.registration_line_items')||quoteNode.parentElement;
    let heldSummaryHeight='';
    function holdSummaryHeight(){
      const height=summaryCard.getBoundingClientRect().height;
      if(height>0){heldSummaryHeight=Math.max(height,parseFloat(heldSummaryHeight)||0)+'px';summaryCard.style.minHeight=heldSummaryHeight;}
    }
    function releaseSummaryHeight(){summaryCard.style.minHeight='';heldSummaryHeight='';}
    const submit = root.querySelector('#submit_registration_checkout');
    const dialog = root.querySelector('#finaidForm');
    const checkbox = root.querySelector('#requestFinAid');
    const previousValue=input=>input.value==='true'?'Yes':input.value==='false'?'No':input.value;
    const selectedDiscount=()=>root.querySelector('#discountValue')?.value || root.querySelector('[name="discountValue"]:checked')?.value || '';
    const save = () => sessionStorage.setItem(KEY, JSON.stringify(state));
    const trashTemplate=root.querySelector('#delete_subscription_item svg')?.cloneNode(true);
    function actionButton(label,kind){
      const button=textElement('button','','summer-row-action');button.type='button';button.setAttribute('aria-label',label);button.title=label;
      button.classList.add(kind==='trash'?'remove_registration_button':'summer-edit-registration');
      if(kind==='trash'&&trashTemplate)button.append(trashTemplate.cloneNode(true));
      else{
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
        const path=document.createElementNS(svg.namespaceURI,'path');
        if(kind==='trash'){path.setAttribute('fill','currentColor');path.setAttribute('d','M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm2.46-7.12 1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14zM15.5 4l-1-1h-5l-1 1H5v2h14V4z');}
        else{svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');path.setAttribute('d','M14 5l5 5M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z');}
        svg.append(path);button.append(svg);
      }
      return button;
    }
    function select(name, placeholder, options, value, change) {
      const input = document.createElement('select'); input.setAttribute('aria-label', name);input.className='registration_select form_main_field_input';
      const first = textElement('option', placeholder); first.value = ''; input.append(first);
      for (const option of options) { const node = textElement('option', option.label); node.value = option.id; input.append(node); }
      input.value = value || ''; input.addEventListener('change', () => change(input.value)); return input;
    }
    function renderRows() {
      const active=list.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;
      list.replaceChildren();
      state.items.forEach((item, index) => {
        const row = document.createElement('tr'),complete=Boolean(item.student_id&&item.session_id),isEditing=!complete||editing.has(item);
        row.className=isEditing?'summer-registration-row is-editing':'summer-registration-row is-confirmed';
        const session=catalog.sessions.find(s=>String(s.id)===String(item.session_id)),student=catalog.students.find(s=>String(s.id)===String(item.student_id));
        const program = document.createElement('td'); program.dataset.label='Program';program.append(textElement('span', 'Summer Shed')); row.append(program);
        const packageCell = document.createElement('td');
        packageCell.dataset.label='Workshop';
        if(isEditing)packageCell.append(select(`Package for registration ${index + 1}`, 'Select Workshop', catalog.sessions.map(session => ({ id: session.id, label: session.name })), item.session_id,
          value => { item.session_id = value; changed(); }));
        else packageCell.append(textElement('span',session?.name||'Selected package','summer-row-value'));
        row.append(packageCell);
        const time = document.createElement('td'); time.dataset.label='Session';
        for(const part of (session?.time||'—').split(' · '))time.append(textElement('span',part,'summer-row-time'));
        row.append(time);
        const studentCell = document.createElement('td');
        studentCell.dataset.label='Student';
        if(isEditing)studentCell.append(select(`Student for registration ${index + 1}`, 'Select Student', catalog.students.map(student => ({ id: student.id, label: student.full_name })), item.student_id,
          value => { item.student_id = value; changed(); }));
        else studentCell.append(textElement('span',student?.full_name||'Selected student','summer-row-value'));
        row.append(studentCell);
        const action = document.createElement('td');action.className='is-delete summer-row-actions';
        if(complete){
          if(isEditing){const done=textElement('button','Done','summer-row-action summer-row-done');done.type='button';done.setAttribute('aria-label',`Done editing registration ${index+1}`);done.addEventListener('click',()=>{editing.delete(item);renderRows();list.querySelector(`[aria-label="Edit registration ${index+1}"]`)?.focus();});action.append(done);}
          else{const edit=actionButton(`Edit registration ${index+1}`,'edit');edit.addEventListener('click',()=>{editing.add(item);renderRows();list.querySelector(`[aria-label="Package for registration ${index+1}"]`)?.focus();});action.append(edit);}
        }
        const remove=actionButton(`Remove registration ${index+1}`,'trash');
        remove.addEventListener('click', () => { editing.delete(item);state.items.splice(index, 1); changed(); }); action.append(remove); row.append(action); list.append(row);
      });
      if(active)[...list.querySelectorAll('[aria-label]')].find(node=>node.getAttribute('aria-label')===active)?.focus({preventScroll:true});
    }
    const line = (label, amount, className = 'summary-line') => {
      const node = textElement('div', '', className); node.append(textElement('span', label), textElement('span', dollars(amount))); return node;
    };
    function renderQuote() {
      quoteNode.replaceChildren();
      const shown=quote||(updating?lastQuote:null);
      const hasAid=state.aid_percent>0;
      const existingDue=root.querySelector('#total_amount_due');
      if(existingDue){existingDue.textContent=shown?dollars(shown.totals.due_now_cents):'—';existingDue.setAttribute('aria-busy',String(updating));}
      if (!shown) { quoteNode.append(textElement('p', updating?'Calculating your total…':quoteFailure?'We could not update your total. Change a selection to try again.':'Select a package and student for each row to see your payment.', 'muted')); return; }
      for (const item of shown.items) {
        const node = textElement('div', '', 'item-line'); node.append(textElement('strong', `${item.student_name} · ${item.package_name}`));
        node.append(line(item.payment_option === 'deposit' ? 'Deposit due today' : 'Full tuition due today', item.due_now_cents));
        if (hasAid&&item.aid_cents) node.append(line(`Financial aid on tuition (${item.aid_percent}%)`, -item.aid_cents));
        if (item.payment_option === 'deposit') node.append(line('Balance after this checkout', item.balance_after_checkout_cents));
        quoteNode.append(node);
      }
      quoteNode.append(line(hasAid?'Total tuition after financial aid':'Total tuition', shown.totals.net_tuition_cents));
      quoteNode.append(line('Balance after this checkout', shown.totals.balance_after_checkout_cents));
      quoteNode.append(line('Amount due today', shown.totals.due_now_cents, 'summary-line due'));
    }
    async function changed() {
      holdSummaryHeight();
      const current = ++version; quote = null;quoteFailure=false;updating=Boolean(state.items.length&&state.items.every(item=>item.student_id&&item.session_id));error.textContent = ''; submit.disabled = true; save();
      checkbox.checked = state.aid_percent > 0;
      root.querySelector('#aidSummary').textContent = state.aid_percent ? `${state.aid_percent}% requested aid on tuition. Deposits stay $100 per Pending child.` : '';
      root.querySelector('#editAid').hidden = !state.aid_percent;
      status(updating?'Updating prices…':'',updating?'loading':'ready');renderRows(); renderQuote();
      if (!updating){if(!state.items.length)releaseSummaryHeight();return;}
      try {
        const result = await api('quote', { items: state.items, aid_percent: state.aid_percent });
        if (current !== version) return;
        quote = result;lastQuote=result;updating=false;renderRows(); renderQuote();submit.disabled = submitting;
        status('Prices updated.');
        priceStatus.append(textElement('span',`Amount due today ${dollars(result.totals.due_now_cents)}. Balance ${dollars(result.totals.balance_after_checkout_cents)}.`,'summer-sr-only'));
        releaseSummaryHeight();
      } catch (failure) { if (current === version){updating=false;quoteFailure=true;renderRows();renderQuote();error.textContent=failure.message;status('Prices could not be updated. Change a selection to try again.','error');} }
    }
    root.querySelector('#add_subscription_item').addEventListener('click', () => { state.items.push({ student_id: '', session_id: '' }); changed(); });
    function openAid() {
      const aid = state.aid_data || {};
      for (const [id, key] of [['finaidRelationship', 'relationship'], ['annualIncome', 'annualIncome'], ['monthlyExpense', 'monthlyExpense']]) root.querySelector(`#${id}`).value = aid[key] ?? '';
      const discount=root.querySelector('#discountValue');if(discount)discount.value=state.aid_percent||'';
      root.querySelectorAll('[name="discountValue"]').forEach(input=>{input.checked=Number(input.value)===state.aid_percent;});
      root.querySelectorAll('[name="previous_participant"]').forEach(input => { input.checked = previousValue(input) === aid.previousParticipant; });
      dialog.showModal();
    }
    checkbox.addEventListener('change', () => { if (checkbox.checked) openAid(); else { state.aid_percent = 0; state.aid_data = null; changed(); } });
    root.querySelector('#editAid').addEventListener('click', openAid);
    root.querySelector('#close-dialog-btn').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { checkbox.checked = state.aid_percent > 0; });
    root.querySelector('#wf-form-Finaid-Form').addEventListener('submit', event => {
      event.preventDefault(); event.stopImmediatePropagation(); if (!event.target.reportValidity()) return;
      state.aid_percent = Number(selectedDiscount());
      state.aid_data = { relationship: root.querySelector('#finaidRelationship').value, annualIncome: root.querySelector('#annualIncome').value,
        monthlyExpense: root.querySelector('#monthlyExpense').value, previousParticipant: previousValue(root.querySelector('[name="previous_participant"]:checked')) };
      dialog.close(); changed();
    },true);
    submit.addEventListener('click', async () => {
      if (!quote || submitting) return;
      submitting = true; submit.disabled = true; error.textContent = ''; submit.textContent = 'Preparing checkout…';
      try {
        const result = await api('checkout', { ...state, quote_fingerprint: quoteIdentity(quote) });
        const destination = new URL(result.url, location.origin);
        if (!(destination.origin === 'https://checkout.stripe.com' || destination.origin === location.origin && destination.pathname === '/checkout-success/summer-camp-success')) throw new Error('Unexpected checkout destination. Please contact Chickenshed.');
        location.assign(destination.href);
      } catch (failure) { error.textContent = failure.message; submitting = false; submit.textContent = 'Continue to checkout'; await changed(); error.textContent = failure.message; }
    });
    await changed();
  } catch (failure) { error.textContent = failure.message;status('Registration could not be loaded. Please try again.','error'); }
}
