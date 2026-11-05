// Shared presentation for the unpublished unified pages only.
export function installRegistrationStyles(){
 if(document.getElementById('registration-order-layout'))return;
 const style=document.createElement('style');style.id='registration-order-layout';
 style.textContent=`
 [data-registration-mounted="true"] [hidden]{display:none!important}
 [data-registration-mounted="true"] #submit_registration_checkout:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;transform:none;transition:none}
 [data-registration-mounted="true"] .registration-pending-notice{display:grid;gap:.75rem;margin:0;padding:1.25rem;border:1px solid #bfe3f0;border-radius:.75rem;background:#dcebf3;color:#062632;text-align:left;line-height:1.6}
 [data-registration-mounted="true"] .registration-pending-notice .alert-title{font-weight:700}
 [data-registration-mounted="true"] .registration-pending-notice .alert-message{margin:0}
 [data-registration-mounted="true"] .registration-status-pill,[data-registration-mounted="true"] #subscription_items_list td>.registration-status-pill{display:block;width:fit-content;max-width:100%;margin:0 0 .5rem;padding:.2rem .625rem;border-radius:999px;background:#dcebf3;color:#062632;font-size:.75rem;font-weight:700;line-height:1.5;white-space:normal}
 [data-registration-mounted="true"] .registration_management_grid>*{min-width:0}
 [data-registration-mounted="true"] .registration_table{width:100%;table-layout:fixed}
 [data-registration-mounted="true"] #subscription_items_list td{min-width:0;white-space:normal;overflow-wrap:anywhere;word-break:normal}
 [data-registration-mounted="true"] #subscription_items_list td>span,[data-registration-mounted="true"] #subscription_items_list td:first-child>span,[data-registration-mounted="true"] .summer-row-time{display:block;max-width:100%;white-space:normal;overflow-wrap:anywhere;word-break:normal}
 [data-registration-mounted="true"] .registration-payment-preference.bento_box{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;width:100%;min-width:0;padding:clamp(1.25rem,2.5vw,2rem);margin:0;text-align:left;justify-items:stretch;align-items:start}
 [data-registration-mounted="true"] .registration-payment-preference label{display:block;margin:0;line-height:1.35}
 [data-registration-mounted="true"] .registration-payment-preference select{display:block;width:100%;max-width:none;min-width:0;min-height:3rem;margin:0;padding:.875rem 2.5rem .875rem 1rem;font:inherit;line-height:1.4}
 [data-registration-mounted="true"] .registration-payment-preference p{margin:0;line-height:1.6;text-align:left}
 [data-registration-mounted="true"] .registration-eligibility-help{margin:1.25rem 0 0;line-height:1.6}
 [data-summer-familiar-success][data-registration-mounted="true"] .registration-success-extra{display:grid;grid-template-columns:minmax(0,1fr);gap:1.5rem;margin:1.5rem 0 0;text-align:left}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems{margin:0}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems>ul{display:grid;grid-template-columns:minmax(0,1fr);gap:1.5rem;list-style:none;margin:0;padding:0}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems li.registration-success-item{display:grid;gap:.75rem;width:100%;min-width:0;margin:0;padding:clamp(1.25rem,2.5vw,2rem);border:0;text-align:left;align-items:start;justify-items:start}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems li.registration-success-item>strong{display:block;margin:0;line-height:1.4;overflow-wrap:anywhere}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems li.registration-success-item>p{margin:0;line-height:1.6}
 [data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems>p{margin:1.25rem 0 0;line-height:1.6}
 [data-summer-familiar-success][data-registration-mounted="true"] .registration-order-actions{display:flex;justify-content:center;margin:0}
 [data-summer-familiar-success][data-registration-mounted="true"] .registration-order-continue{display:inline-flex;align-items:center;justify-content:center;width:auto;max-width:100%;min-height:3rem;padding:.875rem 1.5rem;text-decoration:none;white-space:normal;text-align:center}
 @media(max-width:767px){
  [data-summer-familiar-success][data-registration-mounted="true"] .registration-success-extra,[data-summer-familiar-success][data-registration-mounted="true"] #summerOrderItems>ul{gap:1.25rem}
  [data-summer-familiar-success][data-registration-mounted="true"] .registration-order-continue{width:100%}
 }
 `;
 document.head.append(style);
}
