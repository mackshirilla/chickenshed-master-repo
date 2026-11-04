import {initializeSummerRegistration} from './registration-controller.mjs';
import {textElement} from './transport.mjs';

// Production candidate page adapter. Configuration intentionally defaults to disabled.
export async function initializeSummerRegistrationPage(){
  if(location.hostname!=='www.chickenshednyc.org'||location.pathname!=='/summer-camp-registration')return;
  let config;try{config=JSON.parse(document.querySelector('#summer-bridge-config')?.textContent||'{}');}catch{return;}
  const root=document.querySelector('main.page_main')||document.querySelector('main');if(!root)return;
  if(root.dataset.summerMounted==='true')return;root.dataset.summerMounted='true';
  const initialDue=root.querySelector('#total_amount_due');if(initialDue)initialDue.textContent='—';
  root.querySelectorAll('*').forEach(node=>{
    if(node.childElementCount)return;
    if(node.textContent.trim()==='Build Subscription')node.textContent='Summer registration';
    if(node.textContent.includes('Any deposit paid today will be subtracted from your first invoice'))node.textContent='Deposits are credited toward that child’s Summer tuition. Chickenshed will follow up about the remaining balance.';
  });
  const message=textElement('p',config.enabled?'Summer registration':'Summer registration is not open yet.','summer-registration-notice');
  root.prepend(message);
  root.querySelectorAll('.loading_wall,.loading_wall_wrap,.dashboard_loading_wall,[data-summer-loading]').forEach(node=>{node.hidden=true;node.style.display='none';});
  root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
  if(config.enabled!==true){root.querySelectorAll('button,input,select').forEach(node=>{node.disabled=true;});return;}
  delete root.dataset.summerApiTenant;delete root.dataset.summerDemo;delete root.dataset.summerLocalTest;delete root.dataset.summerTest;
  root.dataset.summerRegistration='';root.dataset.summerApiBase=config.apiBase;
  const box=root.querySelector('#subscription_line_items_wrap');
  if(!box) {message.textContent='Summer page layout needs review.';return;}
  const headerRow=root.querySelector('#subscription_items_table thead tr');
  if(headerRow?.children.length===4){const actions=document.createElement('th');actions.scope='col';actions.append(textElement('span','Actions','summer-sr-only'));headerRow.append(actions);}
  [...box.children].forEach(node=>{node.hidden=true;node.style.display='none';});
  const orderHeading=box.parentElement?.querySelector(':scope > .u-text-h6');
  if(orderHeading)orderHeading.textContent='Your order';
  initialDue?.parentElement?.classList.add('summer-total-card');
  for(const id of ['subscription_line_items_list','subscription_total','subscription_original_amount','subscription_discount_pill','subscription_line_items_empty','deposit_line_items_container','alertBox','alertBoxEarly','actionRequiredDialog','requestingAnimation']){
    const node=root.querySelector('#'+id);if(node){node.hidden=true;node.style.display='none';}
  }
  const append=(id,tag,text,parent=box)=>{let node=root.querySelector('#'+id);if(!node){node=textElement(tag,text||'');node.id=id;parent.append(node);}return node;};
  append('summerQuote','div').setAttribute('aria-live','polite');
  const submit=append('submit_registration_checkout','button','Continue to checkout');submit.type='button';submit.disabled=true;submit.classList.add('btn_main_wrap');
  append('registration_checkout_error','p').setAttribute('role','alert');
  const checkbox=root.querySelector('#requestFinAid');checkbox.checked=false;checkbox.removeAttribute('required');
  const aidSection=checkbox.closest('.form_main_field_wrap')||checkbox.parentElement.parentElement;
  aidSection.classList.add('bento_box','summer-aid-section');
  const aidDetails=append('summerAidDetails','div','',aidSection);
  append('aidSummary','p','',aidDetails);
  const edit=append('editAid','button','Edit financial aid',aidDetails);edit.type='button';edit.hidden=true;
  const form=root.querySelector('#wf-form-Finaid-Form');
  // The copied regular form keeps its choices in a hidden legacy success panel.
  // Summer applies aid immediately in one form, so reuse those existing controls.
  const choices=root.querySelector('#hiddenDiscounts');
  if(choices){form.append(choices);choices.hidden=false;choices.style.display='block';}
  const legacySubmit=form.querySelector('#submitfinancialAid');
  if(legacySubmit){legacySubmit.hidden=true;legacySubmit.style.display='none';}
  let apply=root.querySelector('#applyDiscount')||form.querySelector('[type="submit"]');
  if(!apply)apply=textElement('button','Apply financial aid');
  apply.type='submit';apply.hidden=false;apply.style.display='';
  const applyLabel=apply.querySelector('.btn_main_text');
  if(applyLabel)applyLabel.textContent='Apply financial aid';else apply.textContent='Apply financial aid';
  form.append(apply);
  form.querySelectorAll('[name="previous_participant"]').forEach(input=>{input.required=true;});
  const discounts=form.querySelectorAll('[name="discountValue"]');discounts.forEach(input=>{input.required=true;});
  for(const option of form.querySelector('#finaidRelationship').options){const name=option.textContent.trim();if(['Parent','Guardian','Self','Other'].includes(name))option.value=name;}
  await initializeSummerRegistration(root);
  root.querySelectorAll('select').forEach(node=>node.classList.add('registration_select','form_main_field_input'));
}
