import {validateUser} from '../../auth/authServices';
export async function initializeRegistrationOrdersPage(kind:'registration'|'success'|'dashboard'){
 let enabled=false;try{enabled=JSON.parse(document.querySelector('#registration-orders-config')?.textContent||'{}').enabled===true;}catch{}
 if(!enabled)return;
 if(!(await validateUser())){window.location.assign('/login');return;}
 if(kind==='registration'){const {initializeRegistrationPage}=await import('./registration.mjs');await initializeRegistrationPage();}
 else if(kind==='success'){const {initializeRegistrationSuccessPage}=await import('./success.mjs');initializeRegistrationSuccessPage();}
 else {const {initializeRegistrationDashboard}=await import('./dashboard.mjs');await initializeRegistrationDashboard();}
}
