// Shared presentation scoped to the unified registration pages.
export function installRegistrationStyles(){
 if(document.getElementById('registration-order-layout'))return;
 const style=document.createElement('style');style.id='registration-order-layout';
 style.textContent=`
 [data-registration-mounted="true"] [hidden]{display:none!important}
 [data-registration-mounted="true"] #submit_registration_checkout:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;transform:none;transition:none}
 [data-registration-mounted="true"] .registration-pending-notice{display:grid;gap:.75rem;margin:0;padding:1.25rem;border:1px solid #bfe3f0;border-radius:.75rem;background:#dcebf3;color:#062632;text-align:left;line-height:1.6}
 [data-registration-mounted="true"] .registration-pending-notice .alert-title{font-weight:700}
 [data-registration-mounted="true"] .registration-pending-notice .alert-message{margin:0}
 [data-registration-mounted="true"] .registration-validation-notice{display:grid;gap:.875rem;margin:0;padding:1.25rem;border:1px solid #dfba67;border-radius:.75rem;background:#fff4d7;color:#062632;text-align:left;line-height:1.6;min-width:0;overflow-wrap:anywhere}
 [data-registration-mounted="true"] .registration-validation-notice h2,[data-registration-mounted="true"] .registration-validation-notice p{margin:0}
 [data-registration-mounted="true"] .registration-validation-items{display:grid;gap:.75rem;list-style:none;padding:0;margin:0}
 [data-registration-mounted="true"] .registration-validation-items li{display:flex;gap:.5rem 1rem;align-items:center;justify-content:space-between;flex-wrap:wrap}
 [data-registration-mounted="true"] .registration-validation-edit{background:transparent;color:inherit;text-decoration:underline;font:inherit;padding:.25rem 0;text-align:left;cursor:pointer}
 [data-registration-mounted="true"] #subscription_items_list .has-registration-error{background:#fff4d780;box-shadow:inset 3px 0 #c38b20}
 [data-registration-mounted="true"] .registration-status-pill,[data-registration-mounted="true"] #subscription_items_list td>.registration-status-pill{display:block;width:fit-content;max-width:100%;margin:0 0 .5rem;padding:.2rem .625rem;border-radius:999px;background:#dcebf3;color:#062632;font-size:.75rem;font-weight:700;line-height:1.5;white-space:normal}
 [data-registration-mounted="true"] .registration_management_grid>*{min-width:0}
 [data-registration-mounted="true"] .registration_table{width:100%;table-layout:fixed}
 [data-registration-mounted="true"] #subscription_items_list td{min-width:0;white-space:normal;overflow-wrap:anywhere;word-break:normal}
 /* Outrank the later Webflow embed's first-column nowrap rule. */
 [data-registration-mounted="true"] .registration_table #subscription_items_list td>span,[data-registration-mounted="true"] .registration_table #subscription_items_list td:first-child>span,[data-registration-mounted="true"] .registration_table .summer-row-time{display:block;min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere;word-break:normal}
 [data-registration-mounted="true"] .registration-payment-preference.bento_box{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;width:100%;min-width:0;padding:clamp(1.25rem,2.5vw,2rem);margin:0;text-align:left;justify-items:stretch;align-items:start}
 [data-registration-mounted="true"] .registration-payment-preference label{display:block;margin:0;line-height:1.35}
 [data-registration-mounted="true"] .registration-payment-preference select{display:block;width:100%;max-width:none;min-width:0;min-height:3rem;margin:0;padding:.875rem 2.5rem .875rem 1rem;font:inherit;line-height:1.4}
 [data-registration-mounted="true"] .registration-payment-preference p{margin:0;line-height:1.6;text-align:left}
 [data-registration-mounted="true"] .registration-deposit-notice{display:grid;gap:.5rem;padding:1.25rem;border:1px solid #bfe3f0;border-radius:.75rem;background:#dcebf3;color:#062632;line-height:1.6}
 [data-registration-mounted="true"] #registrationPaymentChoice{scroll-margin-block:6rem}
 [data-registration-mounted="true"] .registration-plan-link{display:inline-block;padding:.5rem 0;color:var(--swatch--brand-1,#009fce);text-decoration:underline;text-underline-offset:.2em;font-weight:600}
 [data-registration-mounted="true"] .registration-plan-link:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:.2rem}
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

export function installRegistrationDashboardStyles(){
 if(document.getElementById('registration-dashboard-layout'))return;
 const style=document.createElement('style');style.id='registration-dashboard-layout';
 style.textContent=`
 #registrationOrdersDashboard{display:grid;gap:1.5rem;padding:clamp(1.25rem,2.5vw,2rem);min-width:0}
 #registrationOrdersDashboard .registration-dashboard-heading{display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center}
 #registrationOrdersDashboard h2,#registrationOrdersDashboard h3,#registrationOrdersDashboard p{margin:0}
 #registrationOrdersDashboard h2{font-size:1.5rem;line-height:1.35}
 #registrationOrdersDashboard .registration-dashboard-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:1.25rem;min-width:0}
 #registrationOrdersDashboard .registration-order-card{display:flex;flex-direction:column;align-items:flex-start;gap:.75rem;padding:1.5rem;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:1rem;min-width:0;overflow-wrap:anywhere;line-height:1.55;background:color-mix(in srgb,var(--theme--text,#062632) 3%,transparent)}
 #registrationOrdersDashboard .registration-order-card h3{font-size:1.25rem;line-height:1.35;font-weight:700}
 #registrationOrdersDashboard .registration-card-program{font-weight:600}
 #registrationOrdersDashboard .registration-card-status{display:inline-block;max-width:100%;padding:.3rem .75rem;border-radius:999px;background:#dcebf3;color:#062632;font-size:.85rem;font-weight:600}
 #registrationOrdersDashboard .registration-card-status[data-status="active"]{background:#e3efcf}
 #registrationOrdersDashboard .registration-card-actions{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:auto;padding-top:.5rem}
 #registrationOrdersDashboard .registration-card-button{display:inline-flex;align-items:center;justify-content:center;min-height:2.75rem;padding:.625rem 1rem;border:1px solid currentColor;border-radius:.5rem;text-decoration:none;font:inherit;color:inherit;background:transparent;text-align:center;white-space:normal;cursor:pointer}
 #registrationOrdersDashboard .registration-card-button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
 #registrationOrdersDashboard .registration-card-files{display:grid;gap:.75rem;width:100%}
 #registrationOrdersDashboard .registration-card-files:empty,#registrationOrdersDashboard .registration-dashboard-notice:empty{display:none}
 @media(max-width:767px){#registrationOrdersDashboard .registration-dashboard-heading .btn_main_wrap{width:100%;text-align:center}#registrationOrdersDashboard .registration-order-card{padding:1.25rem}}
 `;
 document.head.append(style);
}
