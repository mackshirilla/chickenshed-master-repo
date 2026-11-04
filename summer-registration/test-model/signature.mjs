import { createHmac, timingSafeEqual } from 'node:crypto';
import { SummerError } from './quote.mjs';
export function verifyEvent(rawBody, header, secret, now = Math.floor(Date.now() / 1000)) {
  const bad = () => { throw new SummerError('SIGNATURE_INVALID', 'Invalid payment event.', 400); };
  if (!Buffer.isBuffer(rawBody) || rawBody.length > 262144 || typeof header !== 'string' || !secret) bad();
  const parts = header.split(',').map(pair => pair.trim().split('='));
  const times = parts.filter(([key]) => key === 't').map(([, value]) => value);
  const signatures = parts.filter(([key, value]) => key === 'v1' && /^[a-f0-9]{64}$/i.test(value || '')).map(([, value]) => value);
  if (times.length !== 1 || !/^\d+$/.test(times[0]) || Math.abs(now - Number(times[0])) > 300 || !signatures.length) bad();
  const expected = createHmac('sha256', secret).update(`${times[0]}.`).update(rawBody).digest();
  if (!signatures.some(value => timingSafeEqual(expected, Buffer.from(value, 'hex')))) bad();
  let event; try { event = JSON.parse(rawBody.toString('utf8')); } catch { bad(); }
  if (!event?.id || typeof event.livemode !== 'boolean' || !event.data?.object?.id) bad();
  return event;
}
export function signFixture(event, secret, now = Math.floor(Date.now() / 1000)) {
  const body = Buffer.from(JSON.stringify(event));
  return { body, signature: `t=${now},v1=${createHmac('sha256', secret).update(`${now}.`).update(body).digest('hex')}` };
}
