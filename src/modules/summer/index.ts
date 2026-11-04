import {navigate} from '@xatom/core';
import {validateUser} from '../../auth/authServices';

export async function initializeSummerPage(kind: 'registration' | 'success') {
  if(location.hostname!=='www.chickenshednyc.org')return;
  // No auth/provider request while this page's release gate is closed.
  let enabled=false;
  try { enabled=JSON.parse(document.querySelector('#summer-bridge-config')?.textContent||'{}').enabled===true; } catch {}
  if(enabled && !(await validateUser())) { navigate('/login');return; }
  if(kind==='registration') {
    const {initializeSummerRegistrationPage}=await import('./registration.mjs');
    await initializeSummerRegistrationPage();
  } else {
    const {initializeSummerSuccessPage}=await import('./success.mjs');
    initializeSummerSuccessPage();
  }
}
