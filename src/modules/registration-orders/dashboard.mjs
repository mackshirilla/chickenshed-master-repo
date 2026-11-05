import {transport,dollars,textElement} from './transport.mjs';
import {installRegistrationDashboardStyles} from './styles.mjs';
export function unifiedRegistrationEnabled(){try{return JSON.parse(document.querySelector('#registration-orders-config')?.textContent||'{}').enabled===true;}catch{return false;}}
export function renderExistingRegistrationCards(rows,kind){
 const list=document.querySelector('#registrationOrdersDashboard .registration-dashboard-list');if(!unifiedRegistrationEnabled()||!list)return false;
 list.querySelectorAll(`[data-existing-kind="${kind}"]`).forEach(node=>node.remove());
 for(const row of rows){
  const programId=Number(kind==='subscription'?row.program:row.program_id);if(!Number.isSafeInteger(programId)||programId<=0)continue;
  const card=textElement('article','','registration-order-card');card.dataset.existingKind=kind;
  card.append(textElement('h3',row.program_details?.name||row.program_name||'Program registration'),textElement('p','Existing registration','registration-card-status'),textElement('p','View enrolled students and session details.'));
  const actions=textElement('div','','registration-card-actions'),link=textElement('a','View registrations','registration-card-button');
  const target=new URL('/dashboard/registration/program',location.origin);target.searchParams.set('program',String(programId));target.searchParams.set('subscription',kind==='subscription'?String(row.id):'none');link.href=target.href;actions.append(link);card.append(actions);list.append(card);
 }
 const notice=document.querySelector('#registrationOrdersDashboard .registration-dashboard-notice');if(list.children.length&&notice?.textContent==='Your confirmed registrations will appear here after checkout.')notice.textContent='';
 return true;
}
export async function initializeRegistrationDashboard(root=document.querySelector('main')||document.body){
 if(!unifiedRegistrationEnabled()||root.querySelector('#registrationOrdersDashboard'))return;
 installRegistrationDashboardStyles();
 const section=textElement('section','','bento_box registration-orders-dashboard');section.id='registrationOrdersDashboard';
 const heading=textElement('div','','registration-dashboard-heading');heading.append(textElement('h2','My registrations'));
 const register=textElement('a','Register for a program','btn_main_wrap');register.href=location.hostname==='127.0.0.1'?'/registration-preview':'/program-registration';heading.append(register);section.append(heading);
 const notice=textElement('p','Loading your registrations…','registration-dashboard-notice');notice.setAttribute('role','status');const list=textElement('div','','registration-dashboard-list');section.append(notice,list);
 const old=root.querySelector('#listRegistration');const anchor=old?.closest('.bento_box')||old;if(anchor?.parentElement)anchor.before(section);else root.prepend(section);
 for(const id of ['listRegistration','listAddOnRegistration']){const oldList=root.querySelector('#'+id),surface=oldList?.closest('.bento_box')||oldList;if(surface&&!surface.contains(section)){surface.hidden=true;surface.style.display='none';}}
 root.querySelectorAll('#add-registration-button').forEach(el=>{el.style.display='';el.setAttribute('href',register.href);});
 try{const api=transport(root),data=await api('account');notice.textContent=data.registrations.length?'':'Your confirmed registrations will appear here after checkout.';
 for(const item of data.registrations){const card=textElement('article','','registration-order-card');
 const status=textElement('p',`Registration status: ${item.status_label}`,'registration-card-status');status.dataset.status=String(item.status_label||'').toLowerCase();
 card.append(textElement('h3',item.student_name),status,textElement('p',`${item.program_name} · ${item.session_name}`,'registration-card-program'),textElement('p',item.session_time),textElement('p',item.coverage_label));
 const actions=textElement('div','','registration-card-actions');const order=data.orders.find(o=>o.order_id===item.order_id);if(order){card.append(textElement('p',`Amount paid for this registration: ${dollars(item.paid_cents||0)}`));if(item.payment_preference==='monthly')card.append(textElement('p',order.billing_followup==='Arranged'?'Your payment arrangement has been recorded by Chickenshed NYC.':'Monthly payments selected. Chickenshed NYC will contact you to arrange remaining payments.'));if(item.payment_preference==='semester')card.append(textElement('p',order.billing_followup==='Arranged'?'Your semester payment arrangement has been recorded by Chickenshed NYC.':'Pay per semester selected. Chickenshed NYC will follow up about remaining or later semester payments.'));const receipt=textElement('a','View order','registration-card-button');receipt.href=(location.hostname==='127.0.0.1'?'/registration-success-preview':'/checkout-success/registration-order')+'?session_id='+encodeURIComponent(item.receipt_session_id);actions.append(receipt);}
 card.append(actions);
 if(item.resources_available){const button=textElement('button','Class files and resources','registration-card-button');button.type='button';const files=textElement('div','','registration-card-files');button.addEventListener('click',async()=>{button.disabled=true;files.replaceChildren(textElement('p','Loading resources…'));try{const rows=await api('resources?registration_id='+encodeURIComponent(item.registration_id));files.replaceChildren();if(!rows.length)files.append(textElement('p','No class resources have been shared yet.'));for(const file of rows){let url;try{url=new URL(file.url);}catch{continue;}if(url.protocol!=='https:')continue;const link=textElement('a',file.name||'Class resource');link.href=url.href;link.target='_blank';link.rel='noopener';files.append(link);}}catch(e){files.replaceChildren(textElement('p',e.message));}finally{button.disabled=false;}});actions.append(button);card.append(files);}list.append(card);}
 }catch(e){notice.textContent=e.message;}
}
