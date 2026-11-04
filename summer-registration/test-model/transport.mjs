export function transport(root) {
  const base = root.dataset.summerApiBase;
  if (!base) throw new Error('Summer registration is not connected yet. Please contact Chickenshed.');
  const url = new URL(base, location.origin);
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  if (!local && url.protocol !== 'https:') throw new Error('A secure registration connection is required.');
  const demo = local && root.dataset.summerDemo === 'true';
  const tenant=root.dataset.summerApiTenant;
  if(tenant && !(tenant==='spgm-3uz8-a402' && url.origin==='https://xszy-vp96-kdkh.n7c.xano.io' &&
    (local || location.hostname==='chickenshednyc2024.webflow.io'))) throw new Error('Summer sandbox routing is unavailable.');
  const getToken = () => {
    if (demo) return root.dataset.summerStaff === 'true' ? 'local-fixture-staff' : 'local-fixture-family';
    if(local && tenant==='spgm-3uz8-a402')return sessionStorage.getItem('summerSandboxAuth');
    // Matches the existing app's documented authConfig storage contract; never log or persist this token.
    try { return JSON.parse(localStorage.getItem('auth_config') || '{}').token; } catch { return null; }
  };
  return async (path, input) => {
    const token = getToken(); if (!token) throw new Error('Please sign in to continue.');
    const response = await fetch(`${url.href.replace(/\/$/, '')}/${path}`, {
      method: input === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${token}`, ...(tenant?{'X-Tenant':tenant}:{}), ...(input === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }), cache: 'no-store'
    });
    const result = await response.json();
    if(response.status===401&&local&&tenant==='spgm-3uz8-a402'){
      sessionStorage.removeItem('summerSandboxAuth');location.assign('/summer-test');
      throw new Error('The temporary test session expired. Reconnect the prepared test family.');
    }
    if (!response.ok) throw new Error(result.message || 'Registration is temporarily unavailable.');
    return result;
  };
}
export const dollars = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export function textElement(tag, text, className) {
  const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node;
}
