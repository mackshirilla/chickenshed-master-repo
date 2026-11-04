// Production candidate, not deployed. Guard defaults closed.
query "summer/payment-events" verb=POST {
 api_group = "Summer Registration"
 input {

 }
 stack {
function.run summer_live_guard_v1 { input = {} } as $live_guard
util.get_raw_input { encoding = "none"
 exclude_middleware = true } as $raw
api.lambda {
 code = """
  const POLICY = 'summer_family_v1';
  const AID_RATES = Object.freeze([0, 10, 20, 35, 50, 75]);
  class SummerError extends Error {
    constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
  }
  function requireValue(condition, code, message, status = 400) {
    if (!condition) throw new SummerError(code, message, status);
  }
  const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
  function quoteFamily(request, { actorId, students, sessions, coupons }) {
    requireValue(Array.isArray(request.items) && request.items.length > 0 && request.items.length <= 30,
      'ITEMS_REQUIRED', 'Add at least one child and package.');
    const aidPercent = Number(request.aid_percent ?? 0);
    requireValue(AID_RATES.includes(aidPercent), 'INVALID_AID', 'Choose an available financial aid percentage.');
    const seen = new Set();
    const items = request.items.map(input => {
      requireValue(positiveId(input.student_id) && positiveId(input.session_id), 'INVALID_ITEM', 'Select a child and package for every row.');
      const studentId = Number(input.student_id), sessionId = Number(input.session_id);
      const student = students.find(row => row.id === studentId && row.parent_user_id === actorId);
      requireValue(student && student.Status !== 'Archived', 'STUDENT_UNAVAILABLE', 'A selected student is unavailable.', 403);
      requireValue(['Pending', 'Approved'].includes(student.Status), 'STUDENT_STATUS', 'Please contact Chickenshed about this student’s profile.');
      const session = sessions.find(row => row.id === sessionId && row.program_id === 13 && !row.draft && !row.archived);
      requireValue(session, 'SESSION_UNAVAILABLE', 'A selected summer package is unavailable.');
      const key = `${studentId}:${sessionId}`;
      requireValue(!seen.has(key), 'DUPLICATE_ITEM', 'This child and package are already in your registration.');
      seen.add(key);
      for (const product of [session.tuition, session.deposit]) {
        requireValue(product?.price_id && product?.product_id && Number.isSafeInteger(product.cents) && product.cents > 0 &&
          product.active === true && product.currency === 'usd' && product.type === 'one_time', 'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
      }
      requireValue(session.deposit.cents === 10000 && session.tuition.product_id !== session.deposit.product_id,
        'CATALOG_INVALID', 'Summer pricing is temporarily unavailable.', 503);
      const tuitionCents = session.tuition.cents;
      const aidCents = Math.round(tuitionCents * aidPercent / 100);
      const netCents = tuitionCents - aidCents;
      const option = student.Status === 'Pending' ? 'deposit' : 'full';
      const grossDueCents = option === 'deposit' ? session.deposit.cents : tuitionCents;
      const checkoutDiscountCents = option === 'full' ? aidCents : 0;
      const dueCents = grossDueCents - checkoutDiscountCents;
      requireValue(netCents >= dueCents, 'CATALOG_INVALID', 'Please contact Chickenshed about this package.', 503);
      return {
        student_id: studentId, student_name: student.full_name, student_status: student.Status,
        session_id: sessionId, package_name: session.name, session_time: String(session.time || '').slice(0,200), program_id: 13,
        tuition_product: session.tuition.product_id, tuition_price: session.tuition.price_id,
        deposit_product: session.deposit.product_id, deposit_price: session.deposit.price_id,
        payment_option: option, aid_percent: aidPercent, tuition_cents: tuitionCents, aid_cents: aidCents,
        net_tuition_cents: netCents, checkout_gross_cents: grossDueCents,
        checkout_discount_cents: checkoutDiscountCents, due_now_cents: dueCents,
        paid_cents: 0, balance_after_checkout_cents: netCents - dueCents,
        charge_price: option === 'deposit' ? session.deposit.price_id : session.tuition.price_id,
        charge_product: option === 'deposit' ? session.deposit.product_id : session.tuition.product_id
      };
    }).sort((a, b) => a.student_id - b.student_id || a.session_id - b.session_id);
    const sum = field => items.reduce((total, row) => total + row[field], 0);
    const totals = {
      tuition_cents: sum('tuition_cents'), aid_cents: sum('aid_cents'), net_tuition_cents: sum('net_tuition_cents'),
      checkout_gross_cents: sum('checkout_gross_cents'), checkout_discount_cents: sum('checkout_discount_cents'),
      due_now_cents: sum('due_now_cents'), balance_after_checkout_cents: sum('balance_after_checkout_cents')
    };
    const lines = new Map();
    for (const row of items) {
      const line = lines.get(row.charge_price) || { price: row.charge_price, product: row.charge_product, quantity: 0, amount_subtotal: 0, amount_discount: 0, amount_total: 0 };
      line.quantity++; line.amount_subtotal += row.checkout_gross_cents;
      line.amount_discount += row.checkout_discount_cents; line.amount_total += row.due_now_cents;
      lines.set(line.price, line);
    }
    let couponId = null;
    if (totals.checkout_discount_cents > 0) {
      const coupon = coupons.find(row => row.percent_off === aidPercent);
      const tuitionProducts = [...new Set(sessions.map(row => row.tuition.product_id))].sort();
      requireValue(coupon?.valid && coupon.duration === 'once' && Array.isArray(coupon.products) &&
        JSON.stringify([...coupon.products].sort()) === JSON.stringify(tuitionProducts),
      'AID_UNAVAILABLE', 'Financial aid pricing is temporarily unavailable.', 503);
      couponId = coupon.id;
    }
    return { policy: POLICY, currency: 'usd', aid_percent: aidPercent, items, totals,
      lines: [...lines.values()].sort((a, b) => a.price.localeCompare(b.price)), coupon_id: couponId };
  }
  
  function quoteIdentity(quote) {
    // Explicit field order survives JSON key reordering by Xano and HTTP serializers.
    return JSON.stringify({ policy: quote.policy, coupon: quote.coupon_id,
      items: quote.items.map(item => [item.student_id, item.session_id, item.student_status,
        item.tuition_price, item.deposit_price, item.payment_option, item.aid_percent,
        item.tuition_cents, item.aid_cents, item.net_tuition_cents, item.checkout_gross_cents,
        item.checkout_discount_cents, item.due_now_cents, item.balance_after_checkout_cents]),
      totals: ['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(key => quote.totals[key]) });
  }
  
  function validateAidIntake(percent, input) {
    if (percent === 0) return null;
    const data = input || {};
    requireValue(['Parent', 'Guardian', 'Grandparent', 'Other'].includes(data.relationship), 'AID_DETAILS', 'Please complete your financial aid details.');
    const dollars = value => Number(String(value ?? '').replace(/,/g, ''));
    requireValue(String(data.annualIncome ?? '').trim() !== '' && String(data.monthlyExpense ?? '').trim() !== '' &&
      Number.isFinite(dollars(data.annualIncome)) && dollars(data.annualIncome) >= 0 &&
      Number.isFinite(dollars(data.monthlyExpense)) && dollars(data.monthlyExpense) >= 0 &&
      ['Yes', 'No'].includes(data.previousParticipant), 'AID_DETAILS', 'Please complete your financial aid details.');
    return { relationship: data.relationship, annualIncome: dollars(data.annualIncome), monthlyExpense: dollars(data.monthlyExpense), previousParticipant: data.previousParticipant };
  }
  
  
  const STRIPE_ACCOUNT = 'acct_1LYZ6CDK5b8P0zFQ';
  // Match the existing test destinations; this does not change the account API version.
  const STRIPE_API_VERSION = '2025-01-27.acacia';
  const PAYMENT_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired', 'checkout.session.async_payment_failed'];
  const idOf = value => typeof value === 'string' ? value : value?.id || null;
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  function normalizeSession(session, lines) {
    requireValue(session?.object === 'checkout.session' && session.livemode === true && session.mode === 'payment' &&
      /^cs_live_/.test(session.id) && ['open','complete','expired'].includes(session.status) &&
      ['unpaid','paid','no_payment_required'].includes(session.payment_status) &&
      Array.isArray(lines?.data) && lines.has_more === false && lines.data.length <= 30,
    'STRIPE_RESPONSE', 'Payment details are unavailable.', 503);
    const normalized = lines.data.map(line => {
      requireValue(line.price?.id && idOf(line.price.product) && Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
        [line.amount_subtotal,line.amount_discount,line.amount_total].every(integer) && (line.amount_tax || 0) === 0,
      'STRIPE_RESPONSE', 'Payment items are unavailable.', 503);
      return {price:line.price.id,product:idOf(line.price.product),quantity:line.quantity,
        amount_subtotal:line.amount_subtotal,amount_discount:line.amount_discount,amount_total:line.amount_total};
    });
    requireValue([session.amount_subtotal,session.amount_total,session.total_details?.amount_discount].every(integer) &&
      (session.total_details?.amount_tax || 0) === 0 && (session.total_details?.amount_shipping || 0) === 0,
    'STRIPE_RESPONSE', 'Payment amount is unavailable.', 503);
    return {id:session.id,mode:session.mode,livemode:session.livemode,currency:session.currency,status:session.status,
      payment_status:session.payment_status,customer:idOf(session.customer),payment_intent:idOf(session.payment_intent),
      metadata:session.metadata || {},amount_subtotal:session.amount_subtotal,amount_total:session.amount_total,
      total_details:{amount_discount:session.total_details.amount_discount},line_items:normalized,
      expires_at:session.expires_at,url:session.url || null};
  }
  function validateCanonical(order, session) {
    requireValue(session?.livemode === true && session.mode === 'payment' && session.currency === 'usd' &&
      session.metadata?.checkout_policy === POLICY && session.metadata.order_reference === order.order_reference &&
      session.metadata.quote_version === String(order.quote_version) && session.customer === (order.stripe_customer_id || null) &&
      (!order.checkout_session_id || order.checkout_session_id === session.id),
    'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    requireValue(session.amount_total === order.quote.totals.due_now_cents &&
      session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
      [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
    requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  function formBody(input) {
    const body = new URLSearchParams();
    const visit = (key,value) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) value.forEach((item,index)=>visit(`${key}[${index}]`,item));
      else if (typeof value === 'object') Object.entries(value).forEach(([name,item])=>visit(key ? `${key}[${name}]` : name,item));
      else body.append(key,String(value));
    };
    Object.entries(input || {}).forEach(([key,value])=>visit(key,value)); return body;
  }
  class StripeLiveClient {
    constructor({key,fetcher=fetch}) {
      requireValue(typeof key === 'string' && /^(rk|sk)_live_/.test(key), 'PAYMENT_SETUP_REQUIRED', 'Stripe setup is incomplete.', 503);
      this.key=key;this.fetcher=fetcher;
    }
    async request(action,id,params={},idempotencyKey) {
      const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
      const routes = {
        price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
        coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
        lines:['GET',`/v1/checkout/sessions/${safeId?id:''}/line_items`],
        create:['POST','/v1/checkout/sessions'],expire:['POST',`/v1/checkout/sessions/${safeId?id:''}/expire`]
      };
      requireValue(routes[action] && (action==='create' || safeId), 'STRIPE_OPERATION', 'Unsupported payment request.', 400);
      const [method,path]=routes[action], url=new URL('https://api.stripe.com'+path);
      const headers={Authorization:`Bearer ${this.key}`,'Stripe-Version':STRIPE_API_VERSION};
      if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
      const body=formBody(params);if(method==='GET')url.search=body.toString();else headers['Content-Type']='application/x-www-form-urlencoded';
      let response,data;
      try {response=await this.fetcher(url.href,{method,headers,...(method==='POST'?{body:body.toString()}:{}),redirect:'error',signal:AbortSignal.timeout(15000)});data=await response.json();}
      catch {requireValue(false,'STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);}
      requireValue(response.ok && !data.error && data.livemode !== false, 'STRIPE_UNAVAILABLE', 'Payment service is temporarily unavailable.', 503);
      return data;
    }
    async retrieve(id) {const s=await this.request('session',id);return normalizeSession(s,await this.request('lines',id,{limit:100}));}
  }
  function signatureHeader(headers) {
    if(typeof headers==='string') {try{headers=JSON.parse(headers);}catch{headers=Object.fromEntries(headers.split(/\r?\n/).map(line=>{const i=line.indexOf(':');return [line.slice(0,i),line.slice(i+1).trim()];}));}}
    if(Array.isArray(headers))headers=Object.fromEntries(headers.map(entry=>Array.isArray(entry)?entry:typeof entry==='string'?(()=>{const i=entry.indexOf(':');return [entry.slice(0,i),entry.slice(i+1).trim()];})():[entry.name||entry.key,entry.value]));
    const matches=Object.entries(headers||{}).filter(([key])=>key.toLowerCase().replace(/^http[_-]/,'').replace(/_/g,'-')==='stripe-signature');
    const value=Array.isArray(matches[0]?.[1])&&matches[0][1].length===1?matches[0][1][0]:matches[0]?.[1];
    requireValue(matches.length===1 && typeof value==='string','SIGNATURE_INVALID','Invalid payment event.',400);
    return value;
  }
  async function verifyNativeEvent(rawBody,header,secret,now=Math.floor(Date.now()/1000)) {
    const bad=()=>requireValue(false,'SIGNATURE_INVALID','Invalid payment event.',400);
    if(typeof rawBody!=='string'||new TextEncoder().encode(rawBody).length>262144||typeof header!=='string'||typeof secret!=='string'||!secret)bad();
    const parts=header.split(',').map(p=>p.trim().split('='));const times=parts.filter(([k])=>k==='t').map(([,v])=>v);
    const signatures=parts.filter(([k,v])=>k==='v1'&&/^[0-9a-f]{64}$/i.test(v||'')).map(([,v])=>v.toLowerCase());
    if(times.length!==1||!/^\d+$/.test(times[0])||!Number.isSafeInteger(Number(times[0]))||Math.abs(now-Number(times[0]))>300||!signatures.length)bad();
    const encoder=new TextEncoder(),key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const expected=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${times[0]}.${rawBody}`)));
    let matched=0;for(const value of signatures){let difference=0;for(let i=0;i<32;i++)difference|=expected[i]^parseInt(value.slice(i*2,i*2+2),16);matched|=Number(difference===0);}if(!matched)bad();
    let event;try{event=JSON.parse(rawBody);}catch{bad();}
    if(!event||typeof event.id!=='string'||!event.id.startsWith('evt_')||typeof event.type!=='string'||!event.data?.object?.id||event.livemode!==true||(event.account&&event.account!==STRIPE_ACCOUNT))bad();
    return {ok:true,event_id:event.id,event_type:event.type,object_id:event.data.object.id,
      order_reference:event.data.object.metadata?.order_reference||'',policy:event.data.object.metadata?.checkout_policy||'',
      supported:PAYMENT_EVENTS.includes(event.type)};
  }
  
  
  // Private order metadata carries the link; neither clients nor receipts can set it.
  function linkedAidIntake(intake, previous) {
    const id=previous?.financial_aid_submission_id;
    return Number.isSafeInteger(id)&&id>0 ? {...(intake||{}),financial_aid_submission_id:id} : intake;
  }
  
  function planAidSubmission(phase,order,existing,contactId=null) {
    if(!['reserve','replace'].includes(phase)||!order||order.status==='paid')return {action:'none'};
    requireValue(order.checkout_policy===POLICY,'AID_RECORD','Summer aid could not be saved.',503);
    const id=order.aid_intake?.financial_aid_submission_id;
    if(id)requireValue(existing?.id===id&&existing.user_id===order.owner_user_id&&!existing.subscription_id,
      'AID_RECORD','Summer aid could not be saved.',503);
    else requireValue(!existing,'AID_RECORD','Summer aid could not be saved.',503);
    const percent=Number(order.quote.aid_percent||0);
    if(!percent)return id&&existing.status!=='Cancelled'?{action:'cancel',id,data:{status:'Cancelled'}}:{action:'none'};
    const intake=validateAidIntake(percent,order.aid_intake);
    const data={record_title:`Summer Shed — Order #${order.id} — ${order.quote.items.map(i=>i.student_name).join(', ')}`.slice(0,240),
      annual_income:intake.annualIncome,monthly_expenses:intake.monthlyExpense,relationship:intake.relationship,
      previous_participant:intake.previousParticipant==='Yes',user_id:order.owner_user_id,
      contact_id:contactId||null,selected_discount:percent};
    if(!id)return {action:'add',data:{...data,status:'Pending',subscription_id:null,ends_on:null}};
    const changed=Object.entries(data).some(([key,value])=>(existing[key]??null)!==value);
    return changed||(existing.status==='Cancelled'&&phase==='replace')?{action:'edit',id,data:{...data,status:'Pending'}}:{action:'none'};
  }
  
  
  // Payment stays on the order; these rows are staff-managed placements.
  function planSessionRegistrations(order, existing, catalog) {
    if (order?.status !== 'paid') return {create:[], reused:0};
    const id = value => Number.isSafeInteger(value) && value > 0;
    requireValue(id(order.id) && id(order.owner_user_id) && order.checkout_policy === POLICY &&
      typeof order.checkout_session_id === 'string' && order.checkout_session_id.length > 0 &&
      order.quote?.policy === POLICY && Array.isArray(order.quote.items) && order.quote.items.length > 0 &&
      order.paid_cents === order.quote.totals?.due_now_cents,
    'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
    const key = row => `${row.student_id}:${row.session_id}`;
    const expected = new Set(order.quote.items.map(key));
    requireValue(expected.size === order.quote.items.length && Array.isArray(existing),
      'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
    const found = new Set();
    for (const row of existing) {
      requireValue(row.registration_order_id === order.id && row.parent_user_id === order.owner_user_id &&
        row.program_id === 13 && !row.subscription_id && row.checkout_session_id === order.checkout_session_id &&
        expected.has(key(row)) && !found.has(key(row)),
      'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
      found.add(key(row));
    }
    const optionalId = value => id(value) ? value : null;
    const create = [];
    for (const item of order.quote.items) {
      requireValue(id(item.student_id) && id(item.session_id) && item.program_id === 13 &&
        item.paid_cents === item.due_now_cents,
      'REGISTRATION_LINK', 'Summer registrations need staff review.', 409);
      // A replay must leave staff changes and existing placement details intact.
      if (found.has(key(item))) continue;
      const student = catalog.students.find(row => row.id === item.student_id && row.parent_user_id === order.owner_user_id);
      const session = catalog.sessions.find(row => row.id === item.session_id && row.Parent_program === 13);
      requireValue(student && session && id(session.Tuition_product),
        'REGISTRATION_LINK', 'A Summer student or session needs staff review.', 409);
      const workshop = catalog.workshops.find(row => row.id === session.Parent_workshop);
      const location = catalog.locations.find(row => row.id === session.Location);
      create.push({
        registration_order_id:order.id, status:'Pending', update_status:'Pending',
        student_id:item.student_id, parent_user_id:order.owner_user_id, session_id:item.session_id,
        program_id:13, program_name:'Summer Shed', subscription_id:null,
        workshop_id:optionalId(session.Parent_workshop), workshop_name:workshop?.Name || '',
        weekday:session.Weekday || '', time_block:session.Time_block || '',
        location_id:optionalId(session.Location), location:location?.Name || '',
        product_id:session.Tuition_product, update_product_id:session.Tuition_product,
        checkout_session_id:order.checkout_session_id, move_to:null
      });
    }
    return {create, reused:found.size};
  }
  
  
  function referenceFor(actorId,attempt) {
    requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
      'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
    return `summer_${actorId}_${attempt}`;
  }
  function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,items:order.quote.items,totals:order.quote.totals};}
  const unchanged = result => ({ok:true,write:'none',result});
  const update = (data,result) => ({ok:true,write:'edit',data,result});
  function summerSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Summer return URLs are not configured.',503);
    const path = '/checkout-success/summer-camp-success';
    return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
  }
  function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
    response:{order_id:order.id,status:order.status,url:order.status==='paid'?summerSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
  function reservation(actor,request,quote,reference,version,origin,now) {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Summer return URLs are not configured.',503);
    const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
    const payload={mode:'payment',invoice_creation:{enabled:false},line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
      payment_intent_data:{metadata,receipt_email:actor.email},success_url:summerSuccessUrl(origin),
      cancel_url:`${origin}/summer-camp-registration`,expires_at:Math.floor(now/1000)+1800};
    if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else payload.customer_email=actor.email;
    if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
    return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
      status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
      checkout_session_id:null,checkout_url:null,session_snapshot:null,reservation_payload:payload,stripe_customer_id:actor.stripe_customer_id||null,
      paid_cents:0,payment_intent_id:null,paid_at:null,event_ids:[],handled:false,
      item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.student_status} | ${i.aid_percent}% aid | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n')};
  }
  function planNativeOrder(phase,old,args) {
    const now=args.now||Date.now(),origin=args.origin||'https://www.chickenshednyc.org';
    if(['reserve','replace'].includes(phase)) {
      const {actor,request,context}=args;
      requireValue(actor?.id===context?.actorId&&typeof actor.email==='string'&&actor.email.includes('@'),'UNAUTHORIZED','Please sign in.',401);
      const reference=referenceFor(actor.id,request.attempt_id);
      requireValue(!old||old.owner_user_id===actor.id,'FORBIDDEN','This order is unavailable.',403);
      if(old?.status==='paid')return unchanged(resultFor(old,origin));
      const quote=quoteFamily(request,context),fingerprint=quoteIdentity(quote);
      requireValue(request.quote_fingerprint===fingerprint,'QUOTE_CHANGED','Review the updated payment before continuing.',409);
      const intake=linkedAidIntake(validateAidIntake(quote.aid_percent,request.aid_data),old?.aid_intake);
      if(phase==='reserve'&&old?.checkout_session_id){
        const result={action:'inspect',order:old,fingerprint};
        return old.quote_fingerprint===fingerprint&&JSON.stringify(old.aid_intake)!==JSON.stringify(intake)?update({aid_intake:intake},result):unchanged(result);
      }
      if(phase==='reserve'&&old) {
        requireValue(old.status==='creating'&&old.quote_fingerprint===fingerprint,'CHECKOUT_IN_PROGRESS','Retry your previous checkout before changing it.',409);
        const result={action:'create',order:old};
        return JSON.stringify(old.aid_intake)!==JSON.stringify(intake)?update({aid_intake:intake},result):unchanged(result);
      }
      if(phase==='replace') {
        requireValue(old&&old.checkout_session_id===args.previous_session?.id&&old.quote_version===args.expected_version,
          'CHECKOUT_CHANGED','Checkout changed; refresh before continuing.',409);
        validateCanonical(old,args.previous_session);
        requireValue(args.previous_session.status==='expired'&&args.previous_session.payment_status==='unpaid',
          'PAYMENT_PENDING','The previous checkout must finish before another can open.',409);
      }
      const version=old?old.quote_version+1:1;
      const data=reservation(actor,request,quote,reference,version,origin,now);
      data.aid_intake=intake;
      data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote}]:[];
      return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
    }
    requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
    if(phase==='attach'||phase==='event') {
      const session=args.session;
      const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
      if(phase==='event'&&previous) {
        validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote},session);
        if(session.payment_status==='paid')return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        return unchanged({ignored:true,applied:false});
      }
      try{validateCanonical(old,session);}catch(error){
        if(session?.payment_status==='paid'&&old.status!=='paid')return update({status:'review',review_reason:error.code,
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        throw error;
      }
      if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
      if(session.payment_status==='paid') {
        requireValue(session.status==='complete'&&session.payment_intent,'PAYMENT_PENDING','Payment is still processing.',409);
        const quote=JSON.parse(JSON.stringify(old.quote));quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
        return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
          paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
          event_ids:[...(old.event_ids||[]),...(args.event_id?[args.event_id]:[])]},{action:'done',applied:true});
      }
      requireValue(session.status!=='complete'||phase==='event','PAYMENT_PENDING','Payment is still being checked. Please do not pay again.',409);
      if(phase==='attach')requireValue(session.status==='open'&&typeof session.url==='string'&&new URL(session.url).protocol==='https:'&&new URL(session.url).hostname==='checkout.stripe.com',
        'STRIPE_RESPONSE','Checkout is unavailable.',503);
      return update({status:session.status==='expired'?'expired':'pending',checkout_session_id:session.id,
        checkout_url:session.url||old.checkout_url,session_snapshot:session},{action:'done',applied:false});
    }
    if(phase==='receipt') {requireValue(old.owner_user_id===args.actor_id,'NOT_FOUND','Payment not found.',404);return unchanged(publicReceipt(old));}
    requireValue(false,'ORDER_OPERATION','Unsupported order request.',400);
  }
  
  try { return {ok:true,signature:signatureHeader($env.$http_headers)}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Summer service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $header
precondition ($header.ok === true) {
 error_type = "accessdenied"
 error = "Invalid payment event." }
function.run summer_live_verify_event_v1 { input = {raw_body:$raw,signature:$header.signature} } as $event
var $result { value = {ignored:true} }
conditional {
 if ($event.supported && $event.policy == "summer_family_v1") {
  function.run summer_live_stripe_session_v1 { input = {action:"retrieve",session_id:$event.object_id,payload:null,idempotency_key:null} } as $session
  api.lambda {
 code = """
  const s=$var.session.session,e=$var.event;return {ok:s.metadata?.order_reference===e.order_reference&&s.metadata?.checkout_policy==='summer_family_v1',args:{session:s,event_id:e.event_id}};
  """
 timeout = 30
} as $canonical
  precondition ($canonical.ok === true) { error = "Payment details do not match." }
  function.run summer_live_order_v1 { input = {phase:"event",order_reference:$event.order_reference,args:$canonical.args} } as $fulfilled
  conditional {
   if ($fulfilled.order.status == "paid") {
    function.run summer_live_send_confirmation_v1 { input = {order_id:$fulfilled.order.id} } as $confirmation_email
   }
  }
  api.lambda {
 code = """
  return {applied:$var.fulfilled.applied||false,review:!!$var.fulfilled.error};
  """
 timeout = 30
} as $public
  var.update $result { value = $public }
 }
}
 }
 response = $result
}
