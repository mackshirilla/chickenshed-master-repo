import {requireValue,validateAidIntake,POLICY} from './quote.mjs';

// Private order metadata carries the link; neither clients nor receipts can set it.
export function linkedAidIntake(intake, previous) {
  const id=previous?.financial_aid_submission_id;
  return Number.isSafeInteger(id)&&id>0 ? {...(intake||{}),financial_aid_submission_id:id} : intake;
}

export function planAidSubmission(phase,order,existing,contactId=null) {
  if(!['reserve','replace'].includes(phase)||!order||order.status==='paid')return {action:'none'};
  requireValue(order.checkout_policy===POLICY,'AID_RECORD','Registration aid could not be saved.',503);
  const id=order.aid_intake?.financial_aid_submission_id;
  if(id)requireValue(existing?.id===id&&existing.user_id===order.owner_user_id&&!existing.subscription_id,
    'AID_RECORD','Registration aid could not be saved.',503);
  else requireValue(!existing,'AID_RECORD','Registration aid could not be saved.',503);
  const percent=Number(order.quote.aid_percent||0);
  if(!percent)return id&&existing.status!=='Cancelled'?{action:'cancel',id,data:{status:'Cancelled'}}:{action:'none'};
  const intake=validateAidIntake(percent,order.aid_intake);
  const data={record_title:`Registration — Order #${order.id} — ${[...new Set(order.quote.items.filter(i=>i.aid_percent>0).map(i=>i.student_name))].join(', ')}`.slice(0,240),
    annual_income:intake.annualIncome,monthly_expenses:intake.monthlyExpense,relationship:intake.relationship,
    previous_participant:intake.previousParticipant==='Yes',user_id:order.owner_user_id,
    contact_id:contactId||null,selected_discount:percent};
  if(!id)return {action:'add',data:{...data,status:'Pending',subscription_id:null,ends_on:null}};
  const changed=Object.entries(data).some(([key,value])=>(existing[key]??null)!==value);
  return changed||(existing.status==='Cancelled'&&phase==='replace')?{action:'edit',id,data:{...data,status:'Pending'}}:{action:'none'};
}
