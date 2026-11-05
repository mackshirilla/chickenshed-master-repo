// Unpublished production candidate. Runtime gate defaults closed.
query "registration/checkout" verb=POST {
 api_group = "Unified Registration"
 auth = "users"
 input {
  json items
  int aid_percent?=0
  text? payment_preference?
  json? aid_data?
  text attempt_id
  text quote_fingerprint
 }
 stack {
function.run registration_live_guard_v1 { input = {} } as $sandbox_guard
 api.lambda { code = "return $env.registration_checkout_enabled === 'true';"
 timeout = 5 } as $checkout_enabled
 precondition ($checkout_enabled === true) { error_type = "accessdenied"
 error = "Program registration is not open yet." }
var $request { value = {items:$input.items,aid_percent:$input.aid_percent,aid_data:$input.aid_data,attempt_id:$input.attempt_id,quote_fingerprint:$input.quote_fingerprint,payment_preference:$input.payment_preference} }
function.run registration_live_quote_context_v1 { input = {actor_id:$auth.id,request:$request} } as $quoted
api.lambda {
 code = """
  const POLICY='registration_order_v2';
  const AID_RATES=Object.freeze([0,10,20,35,50,75]);
  const PAYMENT_PREFERENCES=Object.freeze(['full','semester','monthly']);
  class SummerError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
  function requireValue(condition,code,message,status=400){if(!condition)throw new SummerError(code,message,status);}
  const isLab = session => Number(session.program_id ?? session.Parent_program) === 10;
  const isQualifyingPlayers = session => Number(session.program_id ?? session.Parent_program) === 1 && [2,3,4].includes(Number(session.workshop_id ?? session.Parent_workshop));
  const positiveId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
  function coverageFor(session,preference,now=Date.now()){
   if(session.program_id===13)return {key:`summer:${session.id}`,label:'Summer package',period:'package'};
   if(isLab(session)){const start=Number(session.start_date),end=Number(session.end_date);requireValue(start>0&&end>=start&&end>=now,'TERM_UNAVAILABLE','This Lab’s dates need to be confirmed or the Lab has ended. Please contact Chickenshed NYC.',409);return {key:`lab:${session.id}`,label:session.name,period:preference==='semester'?'semester':'lab',start,end};}
   // Semester is a payment arrangement, not a separately dated enrollment.
   // Eligibility follows the actual registered session for every payment choice.
   const start=Number(session.start_date??session.season_start),end=Number(session.end_date??session.season_end);
   requireValue(start>0&&end>start,'TERM_UNAVAILABLE','This session’s dates need to be confirmed. Please contact Chickenshed NYC.',503);
   const year=new Date(start).getUTCFullYear(),season=`${year}–${String(year+1).slice(-2)}`;
   requireValue(now<=end,'TERM_UNAVAILABLE','This session has ended. Please contact Chickenshed NYC.',409);
   return {key:`session:${session.id}`,label:`${season} season`,period:preference==='semester'?'semester':'season',start,end};
  }
  // Only server-owned registration/session/order data enters this normalizer. Profile approval is not membership.
  function enrollmentCoverage(enrollments, {sessions,orders=[],subscriptions=[]}) {
   return enrollments.map(row=>{
    const session=sessions.find(s=>s.id===row.session_id);
    if(!session||Number(session.Parent_program??session.program_id)!==row.program_id||Number(session.Parent_workshop??session.workshop_id)!==row.workshop_id)return {...row,coverage_start:null,coverage_end:null};
    let start=null,end=null;
    if(row.registration_order_id){
     const order=orders.find(o=>o.id===row.registration_order_id&&o.owner_user_id===row.parent_user_id&&o.status==='paid');
     const item=order?.quote?.items?.find(i=>i.student_id===row.student_id&&i.session_id===row.session_id&&i.program_id===row.program_id);
     start=item?.coverage_start;end=item?.coverage_end;
    }else{
     const subscription=subscriptions.find(s=>s.id===row.subscription_id&&s.user_id===row.parent_user_id);
     // Billing cadence does not shorten an Active registration's session coverage.
     if(!row.subscription_id||subscription){start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;}
    }
    return {...row,coverage_start:Number(start)||null,coverage_end:Number(end)||null};
   });
  }
  function labEligibility(studentId, lab, {actorId,enrollments=[],cart=[]}) {
   const start=Number(lab.coverage_start??lab.start_date),end=Number(lab.coverage_end??lab.end_date);
   if(!(start>0&&end>=start))return false;
   const covers=r=>Number(r.coverage_start)>0&&Number(r.coverage_start)<=start&&Number(r.coverage_end)>=end;
   return enrollments.some(r=>r.parent_user_id===actorId&&r.student_id===studentId&&r.status==='Active'&&isQualifyingPlayers(r)&&covers(r))||
    cart.some(i=>i.student_id===studentId&&i.will_be_active===true&&isQualifyingPlayers(i)&&covers(i));
  }
  // Payment options are derived from assigned catalog fields, never legacy recurring prices.
  // Summer retains its current package/deposit flow without offering payment plans.
  function paymentOptions(session) {
   if(session.program_id===13)return ['full'];
   if(Array.isArray(session.payment_options))return PAYMENT_PREFERENCES.filter(p=>session.payment_options.includes(p));
   return ['full',...(session.semester?.price_id?['semester']:[]),...(session.deposit?.price_id?['monthly']:[])];
  }
  function quoteFamily(request,{actorId,students,sessions,coupons,enrollments=[],now=Date.now()}){
   requireValue(Array.isArray(request.items)&&request.items.length>0&&request.items.length<=30,'ITEMS_REQUIRED','Add at least one student and session.');
   const aidPercent=Number(request.aid_percent??0);requireValue(AID_RATES.includes(aidPercent),'INVALID_AID','Choose an available financial aid percentage.');
   const selected=request.items.map(input=>{requireValue(positiveId(input.student_id)&&positiveId(input.session_id),'INVALID_ITEM','Select a student and session for every row.');const student=students.find(s=>s.id===Number(input.student_id)&&s.parent_user_id===actorId),session=sessions.find(s=>s.id===Number(input.session_id)&&[1,3,10,13].includes(s.program_id)&&(!s.add_on||isLab(s))&&!s.draft&&!s.archived);requireValue(student&&['Approved','Pending'].includes(student.Status),'STUDENT_UNAVAILABLE','A selected student is unavailable.',403);requireValue(session,'SESSION_UNAVAILABLE','A selected session is unavailable.');return {student,session};});
   const planned=selected.filter(({session})=>paymentOptions(session).length>1),regular=planned.length>0,preference=regular?request.payment_preference:null;
   requireValue(!regular||PAYMENT_PREFERENCES.includes(preference),'PAYMENT_PREFERENCE','Choose how you would like to pay before continuing.');
   requireValue(!regular||planned.every(({session})=>paymentOptions(session).includes(preference)),'PAYMENT_UNAVAILABLE','This payment option is not available for every selected item with payment plans. Choose another option.',409);
   const seen=new Set();const validPrice=p=>p?.price_id&&p?.product_id&&Number.isSafeInteger(p.cents)&&p.cents>0&&p.active===true&&p.currency==='usd'&&p.type==='one_time';
   const items=selected.map(({student,session})=>{
    const key=`${student.id}:${session.id}`;requireValue(!seen.has(key),'DUPLICATE_ITEM','This student and session are already in your registration.');seen.add(key);
    requireValue(!enrollments.some(e=>e.student_id===student.id&&e.session_id===session.id&&['Active','Pending','Waitlist','Paused'].includes(e.status)),'ALREADY_REGISTERED','This student already has a registration for this session. Contact Chickenshed NYC about changes or later semester payments.',409);
    const lab=isLab(session),paymentPreference=paymentOptions(session).length>1?preference:'full',coverage=coverageFor(session,paymentPreference,now),tuition=paymentPreference==='semester'?session.semester:session.tuition;
    requireValue(validPrice(tuition),'CATALOG_INVALID','Pricing is temporarily unavailable for this session.',503);
    const tuitionCents=tuition.cents,lineAid=aidPercent,aidCents=Math.round(tuitionCents*lineAid/100),net=tuitionCents-aidCents;
    const pending=student.Status==='Pending',monthly=paymentPreference==='monthly',deposit=pending&&Boolean(session.deposit?.price_id)||monthly;
    requireValue(!deposit||(validPrice(session.deposit)&&tuition.product_id!==session.deposit.product_id),'DEPOSIT_UNAVAILABLE','The assigned deposit price needs to be configured for this session. Please contact Chickenshed NYC.',503);
    const gross=deposit?session.deposit.cents:tuitionCents,discount=deposit?0:aidCents,due=gross-discount;
    requireValue(net>=due,'CATALOG_INVALID','Please contact Chickenshed NYC about this session’s deposit.',503);
    return {student_id:student.id,student_name:student.full_name,student_status:student.Status,session_id:session.id,package_name:session.name,session_time:session.time||'',program_id:session.program_id,program_name:session.program_name,workshop_name:session.workshop_name||'',workshop_id:session.workshop_id,registration_kind:lab?'lab':'program',payment_preference:paymentPreference,coverage_key:coverage.key,coverage_label:coverage.label,coverage_start:coverage.start||null,coverage_end:coverage.end||null,tuition_period:coverage.period,deposit_reason:!deposit?null:pending?(monthly?'review_and_monthly':'student_review'):(monthly?'monthly':null),tuition_product:tuition.product_id,tuition_price:tuition.price_id,deposit_product:session.deposit?.product_id||null,deposit_price:session.deposit?.price_id||null,payment_option:deposit?'deposit':'full',aid_percent:lineAid,tuition_cents:tuitionCents,aid_cents:aidCents,net_tuition_cents:net,checkout_gross_cents:gross,checkout_discount_cents:discount,due_now_cents:due,paid_cents:0,balance_after_checkout_cents:net-due,charge_price:deposit?session.deposit.price_id:tuition.price_id,charge_product:deposit?session.deposit.product_id:tuition.product_id};
   }).sort((a,b)=>a.student_id-b.student_id||a.session_id-b.session_id);
   const cart=items.map(i=>({...i,will_be_active:i.student_status==='Approved'}));
   for(const item of items.filter(isLab))requireValue(labEligibility(item.student_id,item,{actorId,enrollments,cart}),'LAB_ELIGIBILITY','Labs require this student to have an Active Players 2, 3 or 4 registration covering the Lab’s dates. You may add a qualifying Players registration for an Approved student in this checkout.',409);
   const effectiveAid=aidPercent;
   const sum=f=>items.reduce((n,i)=>n+i[f],0),totals=Object.fromEntries(['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(f=>[f,sum(f)]));
   const lines=new Map();for(const item of items){const line=lines.get(item.charge_price)||{price:item.charge_price,product:item.charge_product,quantity:0,amount_subtotal:0,amount_discount:0,amount_total:0};line.quantity++;line.amount_subtotal+=item.checkout_gross_cents;line.amount_discount+=item.checkout_discount_cents;line.amount_total+=item.due_now_cents;lines.set(line.price,line);}
   let couponId=null;if(totals.checkout_discount_cents>0){const coupon=coupons.find(c=>c.percent_off===aidPercent),eligible=[...new Set(sessions.flatMap(s=>[s.tuition?.product_id,s.semester?.product_id]).filter(Boolean))].sort();requireValue(coupon?.valid&&coupon.duration==='once'&&Array.isArray(coupon.products)&&JSON.stringify([...coupon.products].sort())===JSON.stringify(eligible),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);couponId=coupon.id;}
   return {policy:POLICY,currency:'usd',payment_preference:preference,aid_percent:effectiveAid,items,totals,lines:[...lines.values()].sort((a,b)=>a.price.localeCompare(b.price)),coupon_id:couponId};
  }
  function quoteIdentity(q){return JSON.stringify({policy:q.policy,preference:q.payment_preference,coupon:q.coupon_id,items:q.items.map(i=>[i.student_id,i.session_id,i.student_status,i.tuition_price,i.deposit_price,i.payment_preference,i.coverage_key,i.coverage_start,i.coverage_end,i.workshop_id,i.payment_option,i.aid_percent,i.tuition_cents,i.aid_cents,i.net_tuition_cents,i.checkout_gross_cents,i.checkout_discount_cents,i.due_now_cents,i.balance_after_checkout_cents])});}
  
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
      session.metadata.quote_version === String(order.quote_version) &&
      (order.stripe_customer_id?session.customer===order.stripe_customer_id:
        order.reservation_payload?.customer_creation==='always'?(/^cus_[A-Za-z0-9_]+$/.test(session.customer||'')||!isSettledSession(session)&&session.customer===null):session.customer===null) &&
      (!order.checkout_session_id || order.checkout_session_id === session.id),
    'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    const promotions = order.reservation_payload?.allow_promotion_codes === true && order.quote.aid_percent === 0;
    if (promotions) {
      const expected = [...order.quote.lines].sort((a,b)=>a.price.localeCompare(b.price));
      const actual = [...session.line_items].sort((a,b)=>a.price.localeCompare(b.price));
      requireValue(actual.length === expected.length && actual.every((line,index)=>{
        const baseline=expected[index];
        return line.price===baseline.price && line.product===baseline.product && line.quantity===baseline.quantity &&
          line.amount_subtotal===baseline.amount_subtotal && integer(line.amount_discount) &&
          line.amount_discount<=line.amount_subtotal && line.amount_total===line.amount_subtotal-line.amount_discount;
      }) && session.amount_subtotal===order.quote.totals.checkout_gross_cents &&
        session.amount_subtotal===actual.reduce((n,l)=>n+l.amount_subtotal,0) &&
        session.amount_total===actual.reduce((n,l)=>n+l.amount_total,0) &&
        session.total_details.amount_discount===actual.reduce((n,l)=>n+l.amount_discount,0),
      'PAYMENT_MISMATCH','Payment discount needs staff review.',409);
      return;
    }
    requireValue(session.amount_total === order.quote.totals.due_now_cents &&
      session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
      [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
    requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  function isSettledSession(session) {
    return session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required';
  }
  function settlementQuote(order,session) {
    validateCanonical(order,session);
    const quote=JSON.parse(JSON.stringify(order.quote));
    if (!(order.reservation_payload?.allow_promotion_codes===true && quote.aid_percent===0)) return quote;
    const discount=session.total_details.amount_discount;
    if (!discount || quote.promotion_discount_cents===discount) return quote;
    for (const line of session.line_items) {
      const items=quote.items.filter(item=>item.charge_price===line.price);
      requireValue(items.length===line.quantity,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
      const each=Math.floor(line.amount_discount/items.length),remainder=line.amount_discount%items.length;
      items.forEach((item,index)=>{
        const amount=each+(index<remainder?1:0);
        requireValue(amount<=item.due_now_cents,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
        item.promotion_discount_cents=amount;
        item.checkout_discount_cents+=amount;
        item.due_now_cents-=amount;
        item.net_tuition_cents-=amount;
      });
    }
    quote.lines=JSON.parse(JSON.stringify(session.line_items));
    quote.promotion_discount_cents=discount;
    quote.totals.promotion_discount_cents=discount;
    quote.totals.checkout_discount_cents=discount;
    quote.totals.due_now_cents=session.amount_total;
    quote.totals.net_tuition_cents-=discount;
    return quote;
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
      requireValue(typeof key === 'string' && /^(rk|sk)_live_/.test(key), 'PAYMENT_SETUP_REQUIRED', 'Registration payment setup is incomplete.', 503);
      this.key=key;this.fetcher=fetcher;
    }
    async request(action,id,params={},idempotencyKey) {
      const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
      const routes = {
        price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
        coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
        customer_update:['POST',`/v1/customers/${safeId?id:''}`],
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
      if(!response.ok||data.error||data.livemode===false){const error=new SummerError('STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);error.stripe_operation=action;error.provider_status=response.status;error.provider_code=data.error?.code||null;throw error;}
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
  
  function planSessionRegistrations(order,existing,catalog){
   if(order?.status!=='paid')return {create:[],reused:0};
   requireValue(order.checkout_policy===POLICY&&order.quote?.policy===POLICY&&order.paid_cents===order.quote.totals.due_now_cents,'REGISTRATION_LINK','These registrations need staff review.',409);
   const key=r=>`${r.student_id}:${r.session_id}`,expected=new Map(order.quote.items.map(i=>[key(i),i])),found=new Set();
   for(const row of existing){const item=expected.get(key(row));requireValue(row.registration_order_id===order.id&&row.parent_user_id===order.owner_user_id&&item&&row.program_id===item.program_id&&!row.subscription_id&&row.checkout_session_id===order.checkout_session_id&&!found.has(key(row)),'REGISTRATION_LINK','These registrations need staff review.',409);found.add(key(row));}
   const enrollments=enrollmentCoverage(catalog.enrollments||[],catalog);
   const cart=order.quote.items.map(i=>{const student=catalog.students.find(s=>s.id===i.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===i.session_id),prior=existing.find(r=>key(r)===key(i));return {...i,program_id:session?.Parent_program,workshop_id:session?.Parent_workshop,will_be_active:prior?prior.status==='Active':student?.Status==='Approved'};});
   for(const item of order.quote.items.filter(isLab)){if(found.has(key(item)))continue;const session=catalog.sessions.find(s=>s.id===item.session_id);requireValue(session?.Parent_program===10&&Number(session.Start_Date)===item.coverage_start&&Number(session.End_Date)===item.coverage_end&&labEligibility(item.student_id,item,{actorId:order.owner_user_id,enrollments,cart}),'LAB_ELIGIBILITY','Lab eligibility changed. Payment is recorded and staff must review this registration.',409);}
   const create=[];for(const item of order.quote.items){if(found.has(key(item)))continue;const student=catalog.students.find(s=>s.id===item.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===item.session_id&&s.Parent_program===item.program_id),workshop=catalog.workshops.find(w=>w.id===session?.Parent_workshop),location=catalog.locations.find(l=>l.id===session?.Location);requireValue(student&&session&&[1,3,10,13].includes(item.program_id)&&['Approved','Pending'].includes(student.Status)&&item.paid_cents===item.due_now_cents,'REGISTRATION_LINK','A student or session needs staff review.',409);const status=student.Status==='Approved'?'Active':'Pending';create.push({registration_order_id:order.id,status,update_status:status,student_id:item.student_id,parent_user_id:order.owner_user_id,session_id:item.session_id,program_id:item.program_id,program_name:item.program_name,subscription_id:null,workshop_id:session.Parent_workshop||null,workshop_name:workshop?.Name||item.workshop_name||'',weekday:session.Weekday||'',time_block:session.Time_block||'',location_id:session.Location||null,location:location?.Name||'',product_id:session.Tuition_product,update_product_id:session.Tuition_product,checkout_session_id:order.checkout_session_id,move_to:null});}
   return {create,reused:found.size};
  }
  
  
  function referenceFor(actorId,attempt) {
    requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
      'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
    return `registration_${actorId}_${attempt}`;
  }
  function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,payment_preference:order.payment_preference,covered_terms:order.covered_terms,billing_followup:order.billing_followup,items:order.quote.items,totals:order.quote.totals};}
  const unchanged = result => ({ok:true,write:'none',result});
  const update = (data,result) => ({ok:true,write:'edit',data,result});
  function registrationSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const path = '/checkout-success/registration-order';
    return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
  }
  function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
    response:{order_id:order.id,status:order.status,url:order.status==='paid'?registrationSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
  function reservation(actor,request,quote,reference,version,origin,now) {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
    const payload={mode:'payment',payment_method_types:['card'],line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
      payment_intent_data:{metadata,receipt_email:actor.email,setup_future_usage:'off_session'},success_url:registrationSuccessUrl(origin),
      cancel_url:`${origin}/program-registration`,expires_at:Math.floor(now/1000)+1800};
    if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else {payload.customer_email=actor.email;payload.customer_creation='always';}
    if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
    if(quote.aid_percent===0)payload.allow_promotion_codes=true;
    return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
      payment_preference:quote.payment_preference||'full',covered_terms:[...new Set(quote.items.map(i=>i.coverage_label))].join('; '),billing_followup:quote.items.some(i=>i.balance_after_checkout_cents>0||i.payment_preference==='semester')?'Needs arrangement':'Not required',status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
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
        const result={action:'inspect',order:old,fingerprint,upgrade_promotions:quote.aid_percent===0&&old.reservation_payload?.allow_promotion_codes!==true};
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
      data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote,allow_promotion_codes:old.reservation_payload?.allow_promotion_codes===true}]:[];
      return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
    }
    requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
    if(phase==='attach'||phase==='event') {
      const session=args.session;
      const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
      if(phase==='event'&&previous) {
        validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote,reservation_payload:{allow_promotion_codes:previous.allow_promotion_codes===true}},session);
        if(isSettledSession(session))return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        return unchanged({ignored:true,applied:false});
      }
      try{validateCanonical(old,session);}catch(error){
        if(isSettledSession(session)&&old.status!=='paid')return update({status:'review',review_reason:error.code,
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        throw error;
      }
      if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
      if(isSettledSession(session)) {
        requireValue(session.status==='complete' && (session.payment_status==='paid' && session.amount_total>0 && session.payment_intent ||
          isSettledSession(session) && session.amount_total===0 && !session.payment_intent),
        'PAYMENT_PENDING','Payment is still processing.',409);
        const quote=settlementQuote(old,session);quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
        return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
          balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,
          item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)}${i.promotion_discount_cents?' | coupon $'+(i.promotion_discount_cents/100).toFixed(2):''} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n'),
          stripe_customer_id:session.customer||old.stripe_customer_id||null,paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
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
  
  // Stripe stores the card. This helper sees only canonical Stripe IDs and never card numbers/CVC.
  async function saveFamilyPaymentMethod(order,client){
   requireValue(order?.checkout_policy===POLICY&&order.status==='paid','PAYMENT_METHOD_ORDER','A confirmed registration is required.');
   if(!order.payment_intent_id||!order.paid_cents)return {saved:false,reason:'no_payment_collected',default_changed:false};
   const s=await client.request('session',order.checkout_session_id,{expand:['customer','payment_intent.payment_method']});
   const customer=s.customer,pi=s.payment_intent,method=pi?.payment_method;
   requireValue(s.livemode===true&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.checkout_policy===POLICY&&s.metadata.order_reference===order.order_reference&&s.metadata.quote_version===String(order.quote_version)&&customer?.id===order.stripe_customer_id&&pi?.id===order.payment_intent_id&&pi.setup_future_usage==='off_session'&&method?.customer===customer.id&&method.type==='card','PAYMENT_METHOD_MISMATCH','The saved payment method needs staff review.');
   const previous=customer.invoice_settings?.default_payment_method;
   // Existing subscription/customer defaults remain intact. A first saved card becomes the
   // default for staff-created invoices; staff can select another saved card when arranging payments.
   if(previous)return {saved:true,default_changed:false,existing_default_preserved:true};
   const updated=await client.request('customer_update',customer.id,{invoice_settings:{default_payment_method:method.id}},order.order_reference+':default_payment_method');
   requireValue(updated.id===customer.id&&updated.invoice_settings?.default_payment_method===method.id,'PAYMENT_METHOD_UNAVAILABLE','The saved card is attached, but its default setting needs staff review.');
   return {saved:true,default_changed:true,existing_default_preserved:false};
  }
  
  try { // The isolated sandbox may return to the unpublished staging page or the
  // dedicated loopback test page. Never accept an arbitrary redirect origin.
  function registrationReturnOrigin(headers) {
    const staging='https://www.chickenshednyc.org';
    if(typeof headers==='string') {try{headers=JSON.parse(headers);}catch{headers=Object.fromEntries(headers.split(/\r?\n/).map(line=>{const i=line.indexOf(':');return [line.slice(0,i),line.slice(i+1).trim()];}));}}
    if(Array.isArray(headers))headers=Object.fromEntries(headers.map(entry=>Array.isArray(entry)?entry:[entry.name||entry.key,entry.value]));
    const origins=Object.entries(headers||{}).filter(([name])=>name.toLowerCase().replace(/^http[_-]/,'').replace(/_/g,'-')==='origin');
    const value=origins.length?origins[0][1]:staging;
    if(origins.length>1||![staging].includes(value)) {
      const error=new Error('Registration return origin is unavailable.');error.code='ENVIRONMENT';throw error;
    }
    return value;
  }
  
  return {ok:true,reference:referenceFor($auth.id,$var.request.attempt_id),args:{actor:$var.quoted.actor,context:$var.quoted.context,request:$var.request,origin:registrationReturnOrigin($env.$http_headers),now:Date.now()}}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $prepared
precondition ($prepared.ok === true) { error = "Registration sandbox request failed validation." }
function.run registration_live_order_v1 { input = {phase:"reserve",order_reference:$prepared.reference,args:$prepared.args} } as $reserved
var $plan { value = $reserved }
conditional {
 if ($plan.action == "inspect") {
  function.run registration_live_stripe_session_v1 { input = {action:"retrieve",session_id:$plan.order.checkout_session_id,payload:null,idempotency_key:null} } as $previous
  api.lambda {
 code = """
  const POLICY='registration_order_v2';
  const AID_RATES=Object.freeze([0,10,20,35,50,75]);
  const PAYMENT_PREFERENCES=Object.freeze(['full','semester','monthly']);
  class SummerError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
  function requireValue(condition,code,message,status=400){if(!condition)throw new SummerError(code,message,status);}
  const isLab = session => Number(session.program_id ?? session.Parent_program) === 10;
  const isQualifyingPlayers = session => Number(session.program_id ?? session.Parent_program) === 1 && [2,3,4].includes(Number(session.workshop_id ?? session.Parent_workshop));
  const positiveId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
  function coverageFor(session,preference,now=Date.now()){
   if(session.program_id===13)return {key:`summer:${session.id}`,label:'Summer package',period:'package'};
   if(isLab(session)){const start=Number(session.start_date),end=Number(session.end_date);requireValue(start>0&&end>=start&&end>=now,'TERM_UNAVAILABLE','This Lab’s dates need to be confirmed or the Lab has ended. Please contact Chickenshed NYC.',409);return {key:`lab:${session.id}`,label:session.name,period:preference==='semester'?'semester':'lab',start,end};}
   // Semester is a payment arrangement, not a separately dated enrollment.
   // Eligibility follows the actual registered session for every payment choice.
   const start=Number(session.start_date??session.season_start),end=Number(session.end_date??session.season_end);
   requireValue(start>0&&end>start,'TERM_UNAVAILABLE','This session’s dates need to be confirmed. Please contact Chickenshed NYC.',503);
   const year=new Date(start).getUTCFullYear(),season=`${year}–${String(year+1).slice(-2)}`;
   requireValue(now<=end,'TERM_UNAVAILABLE','This session has ended. Please contact Chickenshed NYC.',409);
   return {key:`session:${session.id}`,label:`${season} season`,period:preference==='semester'?'semester':'season',start,end};
  }
  // Only server-owned registration/session/order data enters this normalizer. Profile approval is not membership.
  function enrollmentCoverage(enrollments, {sessions,orders=[],subscriptions=[]}) {
   return enrollments.map(row=>{
    const session=sessions.find(s=>s.id===row.session_id);
    if(!session||Number(session.Parent_program??session.program_id)!==row.program_id||Number(session.Parent_workshop??session.workshop_id)!==row.workshop_id)return {...row,coverage_start:null,coverage_end:null};
    let start=null,end=null;
    if(row.registration_order_id){
     const order=orders.find(o=>o.id===row.registration_order_id&&o.owner_user_id===row.parent_user_id&&o.status==='paid');
     const item=order?.quote?.items?.find(i=>i.student_id===row.student_id&&i.session_id===row.session_id&&i.program_id===row.program_id);
     start=item?.coverage_start;end=item?.coverage_end;
    }else{
     const subscription=subscriptions.find(s=>s.id===row.subscription_id&&s.user_id===row.parent_user_id);
     // Billing cadence does not shorten an Active registration's session coverage.
     if(!row.subscription_id||subscription){start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;}
    }
    return {...row,coverage_start:Number(start)||null,coverage_end:Number(end)||null};
   });
  }
  function labEligibility(studentId, lab, {actorId,enrollments=[],cart=[]}) {
   const start=Number(lab.coverage_start??lab.start_date),end=Number(lab.coverage_end??lab.end_date);
   if(!(start>0&&end>=start))return false;
   const covers=r=>Number(r.coverage_start)>0&&Number(r.coverage_start)<=start&&Number(r.coverage_end)>=end;
   return enrollments.some(r=>r.parent_user_id===actorId&&r.student_id===studentId&&r.status==='Active'&&isQualifyingPlayers(r)&&covers(r))||
    cart.some(i=>i.student_id===studentId&&i.will_be_active===true&&isQualifyingPlayers(i)&&covers(i));
  }
  // Payment options are derived from assigned catalog fields, never legacy recurring prices.
  // Summer retains its current package/deposit flow without offering payment plans.
  function paymentOptions(session) {
   if(session.program_id===13)return ['full'];
   if(Array.isArray(session.payment_options))return PAYMENT_PREFERENCES.filter(p=>session.payment_options.includes(p));
   return ['full',...(session.semester?.price_id?['semester']:[]),...(session.deposit?.price_id?['monthly']:[])];
  }
  function quoteFamily(request,{actorId,students,sessions,coupons,enrollments=[],now=Date.now()}){
   requireValue(Array.isArray(request.items)&&request.items.length>0&&request.items.length<=30,'ITEMS_REQUIRED','Add at least one student and session.');
   const aidPercent=Number(request.aid_percent??0);requireValue(AID_RATES.includes(aidPercent),'INVALID_AID','Choose an available financial aid percentage.');
   const selected=request.items.map(input=>{requireValue(positiveId(input.student_id)&&positiveId(input.session_id),'INVALID_ITEM','Select a student and session for every row.');const student=students.find(s=>s.id===Number(input.student_id)&&s.parent_user_id===actorId),session=sessions.find(s=>s.id===Number(input.session_id)&&[1,3,10,13].includes(s.program_id)&&(!s.add_on||isLab(s))&&!s.draft&&!s.archived);requireValue(student&&['Approved','Pending'].includes(student.Status),'STUDENT_UNAVAILABLE','A selected student is unavailable.',403);requireValue(session,'SESSION_UNAVAILABLE','A selected session is unavailable.');return {student,session};});
   const planned=selected.filter(({session})=>paymentOptions(session).length>1),regular=planned.length>0,preference=regular?request.payment_preference:null;
   requireValue(!regular||PAYMENT_PREFERENCES.includes(preference),'PAYMENT_PREFERENCE','Choose how you would like to pay before continuing.');
   requireValue(!regular||planned.every(({session})=>paymentOptions(session).includes(preference)),'PAYMENT_UNAVAILABLE','This payment option is not available for every selected item with payment plans. Choose another option.',409);
   const seen=new Set();const validPrice=p=>p?.price_id&&p?.product_id&&Number.isSafeInteger(p.cents)&&p.cents>0&&p.active===true&&p.currency==='usd'&&p.type==='one_time';
   const items=selected.map(({student,session})=>{
    const key=`${student.id}:${session.id}`;requireValue(!seen.has(key),'DUPLICATE_ITEM','This student and session are already in your registration.');seen.add(key);
    requireValue(!enrollments.some(e=>e.student_id===student.id&&e.session_id===session.id&&['Active','Pending','Waitlist','Paused'].includes(e.status)),'ALREADY_REGISTERED','This student already has a registration for this session. Contact Chickenshed NYC about changes or later semester payments.',409);
    const lab=isLab(session),paymentPreference=paymentOptions(session).length>1?preference:'full',coverage=coverageFor(session,paymentPreference,now),tuition=paymentPreference==='semester'?session.semester:session.tuition;
    requireValue(validPrice(tuition),'CATALOG_INVALID','Pricing is temporarily unavailable for this session.',503);
    const tuitionCents=tuition.cents,lineAid=aidPercent,aidCents=Math.round(tuitionCents*lineAid/100),net=tuitionCents-aidCents;
    const pending=student.Status==='Pending',monthly=paymentPreference==='monthly',deposit=pending&&Boolean(session.deposit?.price_id)||monthly;
    requireValue(!deposit||(validPrice(session.deposit)&&tuition.product_id!==session.deposit.product_id),'DEPOSIT_UNAVAILABLE','The assigned deposit price needs to be configured for this session. Please contact Chickenshed NYC.',503);
    const gross=deposit?session.deposit.cents:tuitionCents,discount=deposit?0:aidCents,due=gross-discount;
    requireValue(net>=due,'CATALOG_INVALID','Please contact Chickenshed NYC about this session’s deposit.',503);
    return {student_id:student.id,student_name:student.full_name,student_status:student.Status,session_id:session.id,package_name:session.name,session_time:session.time||'',program_id:session.program_id,program_name:session.program_name,workshop_name:session.workshop_name||'',workshop_id:session.workshop_id,registration_kind:lab?'lab':'program',payment_preference:paymentPreference,coverage_key:coverage.key,coverage_label:coverage.label,coverage_start:coverage.start||null,coverage_end:coverage.end||null,tuition_period:coverage.period,deposit_reason:!deposit?null:pending?(monthly?'review_and_monthly':'student_review'):(monthly?'monthly':null),tuition_product:tuition.product_id,tuition_price:tuition.price_id,deposit_product:session.deposit?.product_id||null,deposit_price:session.deposit?.price_id||null,payment_option:deposit?'deposit':'full',aid_percent:lineAid,tuition_cents:tuitionCents,aid_cents:aidCents,net_tuition_cents:net,checkout_gross_cents:gross,checkout_discount_cents:discount,due_now_cents:due,paid_cents:0,balance_after_checkout_cents:net-due,charge_price:deposit?session.deposit.price_id:tuition.price_id,charge_product:deposit?session.deposit.product_id:tuition.product_id};
   }).sort((a,b)=>a.student_id-b.student_id||a.session_id-b.session_id);
   const cart=items.map(i=>({...i,will_be_active:i.student_status==='Approved'}));
   for(const item of items.filter(isLab))requireValue(labEligibility(item.student_id,item,{actorId,enrollments,cart}),'LAB_ELIGIBILITY','Labs require this student to have an Active Players 2, 3 or 4 registration covering the Lab’s dates. You may add a qualifying Players registration for an Approved student in this checkout.',409);
   const effectiveAid=aidPercent;
   const sum=f=>items.reduce((n,i)=>n+i[f],0),totals=Object.fromEntries(['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(f=>[f,sum(f)]));
   const lines=new Map();for(const item of items){const line=lines.get(item.charge_price)||{price:item.charge_price,product:item.charge_product,quantity:0,amount_subtotal:0,amount_discount:0,amount_total:0};line.quantity++;line.amount_subtotal+=item.checkout_gross_cents;line.amount_discount+=item.checkout_discount_cents;line.amount_total+=item.due_now_cents;lines.set(line.price,line);}
   let couponId=null;if(totals.checkout_discount_cents>0){const coupon=coupons.find(c=>c.percent_off===aidPercent),eligible=[...new Set(sessions.flatMap(s=>[s.tuition?.product_id,s.semester?.product_id]).filter(Boolean))].sort();requireValue(coupon?.valid&&coupon.duration==='once'&&Array.isArray(coupon.products)&&JSON.stringify([...coupon.products].sort())===JSON.stringify(eligible),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);couponId=coupon.id;}
   return {policy:POLICY,currency:'usd',payment_preference:preference,aid_percent:effectiveAid,items,totals,lines:[...lines.values()].sort((a,b)=>a.price.localeCompare(b.price)),coupon_id:couponId};
  }
  function quoteIdentity(q){return JSON.stringify({policy:q.policy,preference:q.payment_preference,coupon:q.coupon_id,items:q.items.map(i=>[i.student_id,i.session_id,i.student_status,i.tuition_price,i.deposit_price,i.payment_preference,i.coverage_key,i.coverage_start,i.coverage_end,i.workshop_id,i.payment_option,i.aid_percent,i.tuition_cents,i.aid_cents,i.net_tuition_cents,i.checkout_gross_cents,i.checkout_discount_cents,i.due_now_cents,i.balance_after_checkout_cents])});}
  
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
      session.metadata.quote_version === String(order.quote_version) &&
      (order.stripe_customer_id?session.customer===order.stripe_customer_id:
        order.reservation_payload?.customer_creation==='always'?(/^cus_[A-Za-z0-9_]+$/.test(session.customer||'')||!isSettledSession(session)&&session.customer===null):session.customer===null) &&
      (!order.checkout_session_id || order.checkout_session_id === session.id),
    'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    const promotions = order.reservation_payload?.allow_promotion_codes === true && order.quote.aid_percent === 0;
    if (promotions) {
      const expected = [...order.quote.lines].sort((a,b)=>a.price.localeCompare(b.price));
      const actual = [...session.line_items].sort((a,b)=>a.price.localeCompare(b.price));
      requireValue(actual.length === expected.length && actual.every((line,index)=>{
        const baseline=expected[index];
        return line.price===baseline.price && line.product===baseline.product && line.quantity===baseline.quantity &&
          line.amount_subtotal===baseline.amount_subtotal && integer(line.amount_discount) &&
          line.amount_discount<=line.amount_subtotal && line.amount_total===line.amount_subtotal-line.amount_discount;
      }) && session.amount_subtotal===order.quote.totals.checkout_gross_cents &&
        session.amount_subtotal===actual.reduce((n,l)=>n+l.amount_subtotal,0) &&
        session.amount_total===actual.reduce((n,l)=>n+l.amount_total,0) &&
        session.total_details.amount_discount===actual.reduce((n,l)=>n+l.amount_discount,0),
      'PAYMENT_MISMATCH','Payment discount needs staff review.',409);
      return;
    }
    requireValue(session.amount_total === order.quote.totals.due_now_cents &&
      session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
      [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
    requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  function isSettledSession(session) {
    return session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required';
  }
  function settlementQuote(order,session) {
    validateCanonical(order,session);
    const quote=JSON.parse(JSON.stringify(order.quote));
    if (!(order.reservation_payload?.allow_promotion_codes===true && quote.aid_percent===0)) return quote;
    const discount=session.total_details.amount_discount;
    if (!discount || quote.promotion_discount_cents===discount) return quote;
    for (const line of session.line_items) {
      const items=quote.items.filter(item=>item.charge_price===line.price);
      requireValue(items.length===line.quantity,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
      const each=Math.floor(line.amount_discount/items.length),remainder=line.amount_discount%items.length;
      items.forEach((item,index)=>{
        const amount=each+(index<remainder?1:0);
        requireValue(amount<=item.due_now_cents,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
        item.promotion_discount_cents=amount;
        item.checkout_discount_cents+=amount;
        item.due_now_cents-=amount;
        item.net_tuition_cents-=amount;
      });
    }
    quote.lines=JSON.parse(JSON.stringify(session.line_items));
    quote.promotion_discount_cents=discount;
    quote.totals.promotion_discount_cents=discount;
    quote.totals.checkout_discount_cents=discount;
    quote.totals.due_now_cents=session.amount_total;
    quote.totals.net_tuition_cents-=discount;
    return quote;
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
      requireValue(typeof key === 'string' && /^(rk|sk)_live_/.test(key), 'PAYMENT_SETUP_REQUIRED', 'Registration payment setup is incomplete.', 503);
      this.key=key;this.fetcher=fetcher;
    }
    async request(action,id,params={},idempotencyKey) {
      const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
      const routes = {
        price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
        coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
        customer_update:['POST',`/v1/customers/${safeId?id:''}`],
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
      if(!response.ok||data.error||data.livemode===false){const error=new SummerError('STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);error.stripe_operation=action;error.provider_status=response.status;error.provider_code=data.error?.code||null;throw error;}
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
  
  function planSessionRegistrations(order,existing,catalog){
   if(order?.status!=='paid')return {create:[],reused:0};
   requireValue(order.checkout_policy===POLICY&&order.quote?.policy===POLICY&&order.paid_cents===order.quote.totals.due_now_cents,'REGISTRATION_LINK','These registrations need staff review.',409);
   const key=r=>`${r.student_id}:${r.session_id}`,expected=new Map(order.quote.items.map(i=>[key(i),i])),found=new Set();
   for(const row of existing){const item=expected.get(key(row));requireValue(row.registration_order_id===order.id&&row.parent_user_id===order.owner_user_id&&item&&row.program_id===item.program_id&&!row.subscription_id&&row.checkout_session_id===order.checkout_session_id&&!found.has(key(row)),'REGISTRATION_LINK','These registrations need staff review.',409);found.add(key(row));}
   const enrollments=enrollmentCoverage(catalog.enrollments||[],catalog);
   const cart=order.quote.items.map(i=>{const student=catalog.students.find(s=>s.id===i.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===i.session_id),prior=existing.find(r=>key(r)===key(i));return {...i,program_id:session?.Parent_program,workshop_id:session?.Parent_workshop,will_be_active:prior?prior.status==='Active':student?.Status==='Approved'};});
   for(const item of order.quote.items.filter(isLab)){if(found.has(key(item)))continue;const session=catalog.sessions.find(s=>s.id===item.session_id);requireValue(session?.Parent_program===10&&Number(session.Start_Date)===item.coverage_start&&Number(session.End_Date)===item.coverage_end&&labEligibility(item.student_id,item,{actorId:order.owner_user_id,enrollments,cart}),'LAB_ELIGIBILITY','Lab eligibility changed. Payment is recorded and staff must review this registration.',409);}
   const create=[];for(const item of order.quote.items){if(found.has(key(item)))continue;const student=catalog.students.find(s=>s.id===item.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===item.session_id&&s.Parent_program===item.program_id),workshop=catalog.workshops.find(w=>w.id===session?.Parent_workshop),location=catalog.locations.find(l=>l.id===session?.Location);requireValue(student&&session&&[1,3,10,13].includes(item.program_id)&&['Approved','Pending'].includes(student.Status)&&item.paid_cents===item.due_now_cents,'REGISTRATION_LINK','A student or session needs staff review.',409);const status=student.Status==='Approved'?'Active':'Pending';create.push({registration_order_id:order.id,status,update_status:status,student_id:item.student_id,parent_user_id:order.owner_user_id,session_id:item.session_id,program_id:item.program_id,program_name:item.program_name,subscription_id:null,workshop_id:session.Parent_workshop||null,workshop_name:workshop?.Name||item.workshop_name||'',weekday:session.Weekday||'',time_block:session.Time_block||'',location_id:session.Location||null,location:location?.Name||'',product_id:session.Tuition_product,update_product_id:session.Tuition_product,checkout_session_id:order.checkout_session_id,move_to:null});}
   return {create,reused:found.size};
  }
  
  
  function referenceFor(actorId,attempt) {
    requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
      'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
    return `registration_${actorId}_${attempt}`;
  }
  function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,payment_preference:order.payment_preference,covered_terms:order.covered_terms,billing_followup:order.billing_followup,items:order.quote.items,totals:order.quote.totals};}
  const unchanged = result => ({ok:true,write:'none',result});
  const update = (data,result) => ({ok:true,write:'edit',data,result});
  function registrationSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const path = '/checkout-success/registration-order';
    return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
  }
  function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
    response:{order_id:order.id,status:order.status,url:order.status==='paid'?registrationSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
  function reservation(actor,request,quote,reference,version,origin,now) {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
    const payload={mode:'payment',payment_method_types:['card'],line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
      payment_intent_data:{metadata,receipt_email:actor.email,setup_future_usage:'off_session'},success_url:registrationSuccessUrl(origin),
      cancel_url:`${origin}/program-registration`,expires_at:Math.floor(now/1000)+1800};
    if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else {payload.customer_email=actor.email;payload.customer_creation='always';}
    if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
    if(quote.aid_percent===0)payload.allow_promotion_codes=true;
    return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
      payment_preference:quote.payment_preference||'full',covered_terms:[...new Set(quote.items.map(i=>i.coverage_label))].join('; '),billing_followup:quote.items.some(i=>i.balance_after_checkout_cents>0||i.payment_preference==='semester')?'Needs arrangement':'Not required',status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
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
        const result={action:'inspect',order:old,fingerprint,upgrade_promotions:quote.aid_percent===0&&old.reservation_payload?.allow_promotion_codes!==true};
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
      data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote,allow_promotion_codes:old.reservation_payload?.allow_promotion_codes===true}]:[];
      return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
    }
    requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
    if(phase==='attach'||phase==='event') {
      const session=args.session;
      const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
      if(phase==='event'&&previous) {
        validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote,reservation_payload:{allow_promotion_codes:previous.allow_promotion_codes===true}},session);
        if(isSettledSession(session))return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        return unchanged({ignored:true,applied:false});
      }
      try{validateCanonical(old,session);}catch(error){
        if(isSettledSession(session)&&old.status!=='paid')return update({status:'review',review_reason:error.code,
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        throw error;
      }
      if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
      if(isSettledSession(session)) {
        requireValue(session.status==='complete' && (session.payment_status==='paid' && session.amount_total>0 && session.payment_intent ||
          isSettledSession(session) && session.amount_total===0 && !session.payment_intent),
        'PAYMENT_PENDING','Payment is still processing.',409);
        const quote=settlementQuote(old,session);quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
        return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
          balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,
          item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)}${i.promotion_discount_cents?' | coupon $'+(i.promotion_discount_cents/100).toFixed(2):''} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n'),
          stripe_customer_id:session.customer||old.stripe_customer_id||null,paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
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
  
  // Stripe stores the card. This helper sees only canonical Stripe IDs and never card numbers/CVC.
  async function saveFamilyPaymentMethod(order,client){
   requireValue(order?.checkout_policy===POLICY&&order.status==='paid','PAYMENT_METHOD_ORDER','A confirmed registration is required.');
   if(!order.payment_intent_id||!order.paid_cents)return {saved:false,reason:'no_payment_collected',default_changed:false};
   const s=await client.request('session',order.checkout_session_id,{expand:['customer','payment_intent.payment_method']});
   const customer=s.customer,pi=s.payment_intent,method=pi?.payment_method;
   requireValue(s.livemode===true&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.checkout_policy===POLICY&&s.metadata.order_reference===order.order_reference&&s.metadata.quote_version===String(order.quote_version)&&customer?.id===order.stripe_customer_id&&pi?.id===order.payment_intent_id&&pi.setup_future_usage==='off_session'&&method?.customer===customer.id&&method.type==='card','PAYMENT_METHOD_MISMATCH','The saved payment method needs staff review.');
   const previous=customer.invoice_settings?.default_payment_method;
   // Existing subscription/customer defaults remain intact. A first saved card becomes the
   // default for staff-created invoices; staff can select another saved card when arranging payments.
   if(previous)return {saved:true,default_changed:false,existing_default_preserved:true};
   const updated=await client.request('customer_update',customer.id,{invoice_settings:{default_payment_method:method.id}},order.order_reference+':default_payment_method');
   requireValue(updated.id===customer.id&&updated.invoice_settings?.default_payment_method===method.id,'PAYMENT_METHOD_UNAVAILABLE','The saved card is attached, but its default setting needs staff review.');
   return {saved:true,default_changed:true,existing_default_preserved:false};
  }
  
  try { const old=$var.plan.order,s=$var.previous.session;validateCanonical(old,s);if(isSettledSession(s))return {ok:true,action:'event'};requireValue(s.status!=='complete','PAYMENT_PENDING','Payment is still being checked. Please do not pay again.',409);if(!$var.plan.upgrade_promotions&&old.quote_fingerprint===$var.plan.fingerprint&&s.status==='open'&&s.expires_at>Date.now()/1000)return {ok:true,action:'reuse'};return {ok:true,action:s.status==='open'?'expire':'replace'}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $inspection
  precondition ($inspection.ok === true) { error = "The previous checkout must finish before another can open." }
  conditional {
   if ($inspection.action == "expire") {
    function.run registration_live_stripe_session_v1 { input = {action:"expire",session_id:$previous.session.id,payload:null,idempotency_key:null} } as $expired
    var.update $previous { value = $expired }
   }
  }
  api.lambda {
 code = """
  const POLICY='registration_order_v2';
  const AID_RATES=Object.freeze([0,10,20,35,50,75]);
  const PAYMENT_PREFERENCES=Object.freeze(['full','semester','monthly']);
  class SummerError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
  function requireValue(condition,code,message,status=400){if(!condition)throw new SummerError(code,message,status);}
  const isLab = session => Number(session.program_id ?? session.Parent_program) === 10;
  const isQualifyingPlayers = session => Number(session.program_id ?? session.Parent_program) === 1 && [2,3,4].includes(Number(session.workshop_id ?? session.Parent_workshop));
  const positiveId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
  function coverageFor(session,preference,now=Date.now()){
   if(session.program_id===13)return {key:`summer:${session.id}`,label:'Summer package',period:'package'};
   if(isLab(session)){const start=Number(session.start_date),end=Number(session.end_date);requireValue(start>0&&end>=start&&end>=now,'TERM_UNAVAILABLE','This Lab’s dates need to be confirmed or the Lab has ended. Please contact Chickenshed NYC.',409);return {key:`lab:${session.id}`,label:session.name,period:preference==='semester'?'semester':'lab',start,end};}
   // Semester is a payment arrangement, not a separately dated enrollment.
   // Eligibility follows the actual registered session for every payment choice.
   const start=Number(session.start_date??session.season_start),end=Number(session.end_date??session.season_end);
   requireValue(start>0&&end>start,'TERM_UNAVAILABLE','This session’s dates need to be confirmed. Please contact Chickenshed NYC.',503);
   const year=new Date(start).getUTCFullYear(),season=`${year}–${String(year+1).slice(-2)}`;
   requireValue(now<=end,'TERM_UNAVAILABLE','This session has ended. Please contact Chickenshed NYC.',409);
   return {key:`session:${session.id}`,label:`${season} season`,period:preference==='semester'?'semester':'season',start,end};
  }
  // Only server-owned registration/session/order data enters this normalizer. Profile approval is not membership.
  function enrollmentCoverage(enrollments, {sessions,orders=[],subscriptions=[]}) {
   return enrollments.map(row=>{
    const session=sessions.find(s=>s.id===row.session_id);
    if(!session||Number(session.Parent_program??session.program_id)!==row.program_id||Number(session.Parent_workshop??session.workshop_id)!==row.workshop_id)return {...row,coverage_start:null,coverage_end:null};
    let start=null,end=null;
    if(row.registration_order_id){
     const order=orders.find(o=>o.id===row.registration_order_id&&o.owner_user_id===row.parent_user_id&&o.status==='paid');
     const item=order?.quote?.items?.find(i=>i.student_id===row.student_id&&i.session_id===row.session_id&&i.program_id===row.program_id);
     start=item?.coverage_start;end=item?.coverage_end;
    }else{
     const subscription=subscriptions.find(s=>s.id===row.subscription_id&&s.user_id===row.parent_user_id);
     // Billing cadence does not shorten an Active registration's session coverage.
     if(!row.subscription_id||subscription){start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;}
    }
    return {...row,coverage_start:Number(start)||null,coverage_end:Number(end)||null};
   });
  }
  function labEligibility(studentId, lab, {actorId,enrollments=[],cart=[]}) {
   const start=Number(lab.coverage_start??lab.start_date),end=Number(lab.coverage_end??lab.end_date);
   if(!(start>0&&end>=start))return false;
   const covers=r=>Number(r.coverage_start)>0&&Number(r.coverage_start)<=start&&Number(r.coverage_end)>=end;
   return enrollments.some(r=>r.parent_user_id===actorId&&r.student_id===studentId&&r.status==='Active'&&isQualifyingPlayers(r)&&covers(r))||
    cart.some(i=>i.student_id===studentId&&i.will_be_active===true&&isQualifyingPlayers(i)&&covers(i));
  }
  // Payment options are derived from assigned catalog fields, never legacy recurring prices.
  // Summer retains its current package/deposit flow without offering payment plans.
  function paymentOptions(session) {
   if(session.program_id===13)return ['full'];
   if(Array.isArray(session.payment_options))return PAYMENT_PREFERENCES.filter(p=>session.payment_options.includes(p));
   return ['full',...(session.semester?.price_id?['semester']:[]),...(session.deposit?.price_id?['monthly']:[])];
  }
  function quoteFamily(request,{actorId,students,sessions,coupons,enrollments=[],now=Date.now()}){
   requireValue(Array.isArray(request.items)&&request.items.length>0&&request.items.length<=30,'ITEMS_REQUIRED','Add at least one student and session.');
   const aidPercent=Number(request.aid_percent??0);requireValue(AID_RATES.includes(aidPercent),'INVALID_AID','Choose an available financial aid percentage.');
   const selected=request.items.map(input=>{requireValue(positiveId(input.student_id)&&positiveId(input.session_id),'INVALID_ITEM','Select a student and session for every row.');const student=students.find(s=>s.id===Number(input.student_id)&&s.parent_user_id===actorId),session=sessions.find(s=>s.id===Number(input.session_id)&&[1,3,10,13].includes(s.program_id)&&(!s.add_on||isLab(s))&&!s.draft&&!s.archived);requireValue(student&&['Approved','Pending'].includes(student.Status),'STUDENT_UNAVAILABLE','A selected student is unavailable.',403);requireValue(session,'SESSION_UNAVAILABLE','A selected session is unavailable.');return {student,session};});
   const planned=selected.filter(({session})=>paymentOptions(session).length>1),regular=planned.length>0,preference=regular?request.payment_preference:null;
   requireValue(!regular||PAYMENT_PREFERENCES.includes(preference),'PAYMENT_PREFERENCE','Choose how you would like to pay before continuing.');
   requireValue(!regular||planned.every(({session})=>paymentOptions(session).includes(preference)),'PAYMENT_UNAVAILABLE','This payment option is not available for every selected item with payment plans. Choose another option.',409);
   const seen=new Set();const validPrice=p=>p?.price_id&&p?.product_id&&Number.isSafeInteger(p.cents)&&p.cents>0&&p.active===true&&p.currency==='usd'&&p.type==='one_time';
   const items=selected.map(({student,session})=>{
    const key=`${student.id}:${session.id}`;requireValue(!seen.has(key),'DUPLICATE_ITEM','This student and session are already in your registration.');seen.add(key);
    requireValue(!enrollments.some(e=>e.student_id===student.id&&e.session_id===session.id&&['Active','Pending','Waitlist','Paused'].includes(e.status)),'ALREADY_REGISTERED','This student already has a registration for this session. Contact Chickenshed NYC about changes or later semester payments.',409);
    const lab=isLab(session),paymentPreference=paymentOptions(session).length>1?preference:'full',coverage=coverageFor(session,paymentPreference,now),tuition=paymentPreference==='semester'?session.semester:session.tuition;
    requireValue(validPrice(tuition),'CATALOG_INVALID','Pricing is temporarily unavailable for this session.',503);
    const tuitionCents=tuition.cents,lineAid=aidPercent,aidCents=Math.round(tuitionCents*lineAid/100),net=tuitionCents-aidCents;
    const pending=student.Status==='Pending',monthly=paymentPreference==='monthly',deposit=pending&&Boolean(session.deposit?.price_id)||monthly;
    requireValue(!deposit||(validPrice(session.deposit)&&tuition.product_id!==session.deposit.product_id),'DEPOSIT_UNAVAILABLE','The assigned deposit price needs to be configured for this session. Please contact Chickenshed NYC.',503);
    const gross=deposit?session.deposit.cents:tuitionCents,discount=deposit?0:aidCents,due=gross-discount;
    requireValue(net>=due,'CATALOG_INVALID','Please contact Chickenshed NYC about this session’s deposit.',503);
    return {student_id:student.id,student_name:student.full_name,student_status:student.Status,session_id:session.id,package_name:session.name,session_time:session.time||'',program_id:session.program_id,program_name:session.program_name,workshop_name:session.workshop_name||'',workshop_id:session.workshop_id,registration_kind:lab?'lab':'program',payment_preference:paymentPreference,coverage_key:coverage.key,coverage_label:coverage.label,coverage_start:coverage.start||null,coverage_end:coverage.end||null,tuition_period:coverage.period,deposit_reason:!deposit?null:pending?(monthly?'review_and_monthly':'student_review'):(monthly?'monthly':null),tuition_product:tuition.product_id,tuition_price:tuition.price_id,deposit_product:session.deposit?.product_id||null,deposit_price:session.deposit?.price_id||null,payment_option:deposit?'deposit':'full',aid_percent:lineAid,tuition_cents:tuitionCents,aid_cents:aidCents,net_tuition_cents:net,checkout_gross_cents:gross,checkout_discount_cents:discount,due_now_cents:due,paid_cents:0,balance_after_checkout_cents:net-due,charge_price:deposit?session.deposit.price_id:tuition.price_id,charge_product:deposit?session.deposit.product_id:tuition.product_id};
   }).sort((a,b)=>a.student_id-b.student_id||a.session_id-b.session_id);
   const cart=items.map(i=>({...i,will_be_active:i.student_status==='Approved'}));
   for(const item of items.filter(isLab))requireValue(labEligibility(item.student_id,item,{actorId,enrollments,cart}),'LAB_ELIGIBILITY','Labs require this student to have an Active Players 2, 3 or 4 registration covering the Lab’s dates. You may add a qualifying Players registration for an Approved student in this checkout.',409);
   const effectiveAid=aidPercent;
   const sum=f=>items.reduce((n,i)=>n+i[f],0),totals=Object.fromEntries(['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(f=>[f,sum(f)]));
   const lines=new Map();for(const item of items){const line=lines.get(item.charge_price)||{price:item.charge_price,product:item.charge_product,quantity:0,amount_subtotal:0,amount_discount:0,amount_total:0};line.quantity++;line.amount_subtotal+=item.checkout_gross_cents;line.amount_discount+=item.checkout_discount_cents;line.amount_total+=item.due_now_cents;lines.set(line.price,line);}
   let couponId=null;if(totals.checkout_discount_cents>0){const coupon=coupons.find(c=>c.percent_off===aidPercent),eligible=[...new Set(sessions.flatMap(s=>[s.tuition?.product_id,s.semester?.product_id]).filter(Boolean))].sort();requireValue(coupon?.valid&&coupon.duration==='once'&&Array.isArray(coupon.products)&&JSON.stringify([...coupon.products].sort())===JSON.stringify(eligible),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);couponId=coupon.id;}
   return {policy:POLICY,currency:'usd',payment_preference:preference,aid_percent:effectiveAid,items,totals,lines:[...lines.values()].sort((a,b)=>a.price.localeCompare(b.price)),coupon_id:couponId};
  }
  function quoteIdentity(q){return JSON.stringify({policy:q.policy,preference:q.payment_preference,coupon:q.coupon_id,items:q.items.map(i=>[i.student_id,i.session_id,i.student_status,i.tuition_price,i.deposit_price,i.payment_preference,i.coverage_key,i.coverage_start,i.coverage_end,i.workshop_id,i.payment_option,i.aid_percent,i.tuition_cents,i.aid_cents,i.net_tuition_cents,i.checkout_gross_cents,i.checkout_discount_cents,i.due_now_cents,i.balance_after_checkout_cents])});}
  
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
      session.metadata.quote_version === String(order.quote_version) &&
      (order.stripe_customer_id?session.customer===order.stripe_customer_id:
        order.reservation_payload?.customer_creation==='always'?(/^cus_[A-Za-z0-9_]+$/.test(session.customer||'')||!isSettledSession(session)&&session.customer===null):session.customer===null) &&
      (!order.checkout_session_id || order.checkout_session_id === session.id),
    'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    const promotions = order.reservation_payload?.allow_promotion_codes === true && order.quote.aid_percent === 0;
    if (promotions) {
      const expected = [...order.quote.lines].sort((a,b)=>a.price.localeCompare(b.price));
      const actual = [...session.line_items].sort((a,b)=>a.price.localeCompare(b.price));
      requireValue(actual.length === expected.length && actual.every((line,index)=>{
        const baseline=expected[index];
        return line.price===baseline.price && line.product===baseline.product && line.quantity===baseline.quantity &&
          line.amount_subtotal===baseline.amount_subtotal && integer(line.amount_discount) &&
          line.amount_discount<=line.amount_subtotal && line.amount_total===line.amount_subtotal-line.amount_discount;
      }) && session.amount_subtotal===order.quote.totals.checkout_gross_cents &&
        session.amount_subtotal===actual.reduce((n,l)=>n+l.amount_subtotal,0) &&
        session.amount_total===actual.reduce((n,l)=>n+l.amount_total,0) &&
        session.total_details.amount_discount===actual.reduce((n,l)=>n+l.amount_discount,0),
      'PAYMENT_MISMATCH','Payment discount needs staff review.',409);
      return;
    }
    requireValue(session.amount_total === order.quote.totals.due_now_cents &&
      session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
      [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
    requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  function isSettledSession(session) {
    return session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required';
  }
  function settlementQuote(order,session) {
    validateCanonical(order,session);
    const quote=JSON.parse(JSON.stringify(order.quote));
    if (!(order.reservation_payload?.allow_promotion_codes===true && quote.aid_percent===0)) return quote;
    const discount=session.total_details.amount_discount;
    if (!discount || quote.promotion_discount_cents===discount) return quote;
    for (const line of session.line_items) {
      const items=quote.items.filter(item=>item.charge_price===line.price);
      requireValue(items.length===line.quantity,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
      const each=Math.floor(line.amount_discount/items.length),remainder=line.amount_discount%items.length;
      items.forEach((item,index)=>{
        const amount=each+(index<remainder?1:0);
        requireValue(amount<=item.due_now_cents,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
        item.promotion_discount_cents=amount;
        item.checkout_discount_cents+=amount;
        item.due_now_cents-=amount;
        item.net_tuition_cents-=amount;
      });
    }
    quote.lines=JSON.parse(JSON.stringify(session.line_items));
    quote.promotion_discount_cents=discount;
    quote.totals.promotion_discount_cents=discount;
    quote.totals.checkout_discount_cents=discount;
    quote.totals.due_now_cents=session.amount_total;
    quote.totals.net_tuition_cents-=discount;
    return quote;
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
      requireValue(typeof key === 'string' && /^(rk|sk)_live_/.test(key), 'PAYMENT_SETUP_REQUIRED', 'Registration payment setup is incomplete.', 503);
      this.key=key;this.fetcher=fetcher;
    }
    async request(action,id,params={},idempotencyKey) {
      const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
      const routes = {
        price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
        coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
        customer_update:['POST',`/v1/customers/${safeId?id:''}`],
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
      if(!response.ok||data.error||data.livemode===false){const error=new SummerError('STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);error.stripe_operation=action;error.provider_status=response.status;error.provider_code=data.error?.code||null;throw error;}
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
  
  function planSessionRegistrations(order,existing,catalog){
   if(order?.status!=='paid')return {create:[],reused:0};
   requireValue(order.checkout_policy===POLICY&&order.quote?.policy===POLICY&&order.paid_cents===order.quote.totals.due_now_cents,'REGISTRATION_LINK','These registrations need staff review.',409);
   const key=r=>`${r.student_id}:${r.session_id}`,expected=new Map(order.quote.items.map(i=>[key(i),i])),found=new Set();
   for(const row of existing){const item=expected.get(key(row));requireValue(row.registration_order_id===order.id&&row.parent_user_id===order.owner_user_id&&item&&row.program_id===item.program_id&&!row.subscription_id&&row.checkout_session_id===order.checkout_session_id&&!found.has(key(row)),'REGISTRATION_LINK','These registrations need staff review.',409);found.add(key(row));}
   const enrollments=enrollmentCoverage(catalog.enrollments||[],catalog);
   const cart=order.quote.items.map(i=>{const student=catalog.students.find(s=>s.id===i.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===i.session_id),prior=existing.find(r=>key(r)===key(i));return {...i,program_id:session?.Parent_program,workshop_id:session?.Parent_workshop,will_be_active:prior?prior.status==='Active':student?.Status==='Approved'};});
   for(const item of order.quote.items.filter(isLab)){if(found.has(key(item)))continue;const session=catalog.sessions.find(s=>s.id===item.session_id);requireValue(session?.Parent_program===10&&Number(session.Start_Date)===item.coverage_start&&Number(session.End_Date)===item.coverage_end&&labEligibility(item.student_id,item,{actorId:order.owner_user_id,enrollments,cart}),'LAB_ELIGIBILITY','Lab eligibility changed. Payment is recorded and staff must review this registration.',409);}
   const create=[];for(const item of order.quote.items){if(found.has(key(item)))continue;const student=catalog.students.find(s=>s.id===item.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===item.session_id&&s.Parent_program===item.program_id),workshop=catalog.workshops.find(w=>w.id===session?.Parent_workshop),location=catalog.locations.find(l=>l.id===session?.Location);requireValue(student&&session&&[1,3,10,13].includes(item.program_id)&&['Approved','Pending'].includes(student.Status)&&item.paid_cents===item.due_now_cents,'REGISTRATION_LINK','A student or session needs staff review.',409);const status=student.Status==='Approved'?'Active':'Pending';create.push({registration_order_id:order.id,status,update_status:status,student_id:item.student_id,parent_user_id:order.owner_user_id,session_id:item.session_id,program_id:item.program_id,program_name:item.program_name,subscription_id:null,workshop_id:session.Parent_workshop||null,workshop_name:workshop?.Name||item.workshop_name||'',weekday:session.Weekday||'',time_block:session.Time_block||'',location_id:session.Location||null,location:location?.Name||'',product_id:session.Tuition_product,update_product_id:session.Tuition_product,checkout_session_id:order.checkout_session_id,move_to:null});}
   return {create,reused:found.size};
  }
  
  
  function referenceFor(actorId,attempt) {
    requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
      'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
    return `registration_${actorId}_${attempt}`;
  }
  function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,payment_preference:order.payment_preference,covered_terms:order.covered_terms,billing_followup:order.billing_followup,items:order.quote.items,totals:order.quote.totals};}
  const unchanged = result => ({ok:true,write:'none',result});
  const update = (data,result) => ({ok:true,write:'edit',data,result});
  function registrationSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const path = '/checkout-success/registration-order';
    return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
  }
  function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
    response:{order_id:order.id,status:order.status,url:order.status==='paid'?registrationSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
  function reservation(actor,request,quote,reference,version,origin,now) {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
    const payload={mode:'payment',payment_method_types:['card'],line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
      payment_intent_data:{metadata,receipt_email:actor.email,setup_future_usage:'off_session'},success_url:registrationSuccessUrl(origin),
      cancel_url:`${origin}/program-registration`,expires_at:Math.floor(now/1000)+1800};
    if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else {payload.customer_email=actor.email;payload.customer_creation='always';}
    if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
    if(quote.aid_percent===0)payload.allow_promotion_codes=true;
    return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
      payment_preference:quote.payment_preference||'full',covered_terms:[...new Set(quote.items.map(i=>i.coverage_label))].join('; '),billing_followup:quote.items.some(i=>i.balance_after_checkout_cents>0||i.payment_preference==='semester')?'Needs arrangement':'Not required',status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
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
        const result={action:'inspect',order:old,fingerprint,upgrade_promotions:quote.aid_percent===0&&old.reservation_payload?.allow_promotion_codes!==true};
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
      data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote,allow_promotion_codes:old.reservation_payload?.allow_promotion_codes===true}]:[];
      return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
    }
    requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
    if(phase==='attach'||phase==='event') {
      const session=args.session;
      const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
      if(phase==='event'&&previous) {
        validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote,reservation_payload:{allow_promotion_codes:previous.allow_promotion_codes===true}},session);
        if(isSettledSession(session))return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        return unchanged({ignored:true,applied:false});
      }
      try{validateCanonical(old,session);}catch(error){
        if(isSettledSession(session)&&old.status!=='paid')return update({status:'review',review_reason:error.code,
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        throw error;
      }
      if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
      if(isSettledSession(session)) {
        requireValue(session.status==='complete' && (session.payment_status==='paid' && session.amount_total>0 && session.payment_intent ||
          isSettledSession(session) && session.amount_total===0 && !session.payment_intent),
        'PAYMENT_PENDING','Payment is still processing.',409);
        const quote=settlementQuote(old,session);quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
        return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
          balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,
          item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)}${i.promotion_discount_cents?' | coupon $'+(i.promotion_discount_cents/100).toFixed(2):''} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n'),
          stripe_customer_id:session.customer||old.stripe_customer_id||null,paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
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
  
  // Stripe stores the card. This helper sees only canonical Stripe IDs and never card numbers/CVC.
  async function saveFamilyPaymentMethod(order,client){
   requireValue(order?.checkout_policy===POLICY&&order.status==='paid','PAYMENT_METHOD_ORDER','A confirmed registration is required.');
   if(!order.payment_intent_id||!order.paid_cents)return {saved:false,reason:'no_payment_collected',default_changed:false};
   const s=await client.request('session',order.checkout_session_id,{expand:['customer','payment_intent.payment_method']});
   const customer=s.customer,pi=s.payment_intent,method=pi?.payment_method;
   requireValue(s.livemode===true&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.checkout_policy===POLICY&&s.metadata.order_reference===order.order_reference&&s.metadata.quote_version===String(order.quote_version)&&customer?.id===order.stripe_customer_id&&pi?.id===order.payment_intent_id&&pi.setup_future_usage==='off_session'&&method?.customer===customer.id&&method.type==='card','PAYMENT_METHOD_MISMATCH','The saved payment method needs staff review.');
   const previous=customer.invoice_settings?.default_payment_method;
   // Existing subscription/customer defaults remain intact. A first saved card becomes the
   // default for staff-created invoices; staff can select another saved card when arranging payments.
   if(previous)return {saved:true,default_changed:false,existing_default_preserved:true};
   const updated=await client.request('customer_update',customer.id,{invoice_settings:{default_payment_method:method.id}},order.order_reference+':default_payment_method');
   requireValue(updated.id===customer.id&&updated.invoice_settings?.default_payment_method===method.id,'PAYMENT_METHOD_UNAVAILABLE','The saved card is attached, but its default setting needs staff review.');
   return {saved:true,default_changed:true,existing_default_preserved:false};
  }
  
  try { const s=$var.previous.session;if(isSettledSession(s))return {ok:true,phase:'event',args:{session:s,origin:'https://www.chickenshednyc.org'}};if($var.inspection.action==='reuse')return {ok:true,phase:'attach',args:{session:s,origin:'https://www.chickenshednyc.org'}};return {ok:true,phase:'replace',args:{...$var.prepared.args,expected_version:$var.plan.order.quote_version,previous_session:s}}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $next
  precondition ($next.ok === true) { error = "Registration sandbox request failed validation." }
  function.run registration_live_order_v1 { input = {phase:$next.phase,order_reference:$prepared.reference,args:$next.args} } as $changed
  var.update $plan { value = $changed }
 }
}
conditional {
 if ($plan.action == "create") {
  api.lambda {
 code = """
  const o=$var.plan.order;return {key:o.order_reference+':'+o.quote_version,payload:o.reservation_payload};
  """
 timeout = 30
} as $create
  function.run registration_live_stripe_session_v1 { input = {action:"create",session_id:null,payload:$create.payload,idempotency_key:$create.key} } as $session
  function.run registration_live_order_v1 { input = {phase:"attach",order_reference:$prepared.reference,args:{session:$session.session,origin:"https://www.chickenshednyc.org"}} } as $attached
  var.update $plan { value = $attached }
 }
}
api.lambda {
 code = """
  const POLICY='registration_order_v2';
  const AID_RATES=Object.freeze([0,10,20,35,50,75]);
  const PAYMENT_PREFERENCES=Object.freeze(['full','semester','monthly']);
  class SummerError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
  function requireValue(condition,code,message,status=400){if(!condition)throw new SummerError(code,message,status);}
  const isLab = session => Number(session.program_id ?? session.Parent_program) === 10;
  const isQualifyingPlayers = session => Number(session.program_id ?? session.Parent_program) === 1 && [2,3,4].includes(Number(session.workshop_id ?? session.Parent_workshop));
  const positiveId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
  function coverageFor(session,preference,now=Date.now()){
   if(session.program_id===13)return {key:`summer:${session.id}`,label:'Summer package',period:'package'};
   if(isLab(session)){const start=Number(session.start_date),end=Number(session.end_date);requireValue(start>0&&end>=start&&end>=now,'TERM_UNAVAILABLE','This Lab’s dates need to be confirmed or the Lab has ended. Please contact Chickenshed NYC.',409);return {key:`lab:${session.id}`,label:session.name,period:preference==='semester'?'semester':'lab',start,end};}
   // Semester is a payment arrangement, not a separately dated enrollment.
   // Eligibility follows the actual registered session for every payment choice.
   const start=Number(session.start_date??session.season_start),end=Number(session.end_date??session.season_end);
   requireValue(start>0&&end>start,'TERM_UNAVAILABLE','This session’s dates need to be confirmed. Please contact Chickenshed NYC.',503);
   const year=new Date(start).getUTCFullYear(),season=`${year}–${String(year+1).slice(-2)}`;
   requireValue(now<=end,'TERM_UNAVAILABLE','This session has ended. Please contact Chickenshed NYC.',409);
   return {key:`session:${session.id}`,label:`${season} season`,period:preference==='semester'?'semester':'season',start,end};
  }
  // Only server-owned registration/session/order data enters this normalizer. Profile approval is not membership.
  function enrollmentCoverage(enrollments, {sessions,orders=[],subscriptions=[]}) {
   return enrollments.map(row=>{
    const session=sessions.find(s=>s.id===row.session_id);
    if(!session||Number(session.Parent_program??session.program_id)!==row.program_id||Number(session.Parent_workshop??session.workshop_id)!==row.workshop_id)return {...row,coverage_start:null,coverage_end:null};
    let start=null,end=null;
    if(row.registration_order_id){
     const order=orders.find(o=>o.id===row.registration_order_id&&o.owner_user_id===row.parent_user_id&&o.status==='paid');
     const item=order?.quote?.items?.find(i=>i.student_id===row.student_id&&i.session_id===row.session_id&&i.program_id===row.program_id);
     start=item?.coverage_start;end=item?.coverage_end;
    }else{
     const subscription=subscriptions.find(s=>s.id===row.subscription_id&&s.user_id===row.parent_user_id);
     // Billing cadence does not shorten an Active registration's session coverage.
     if(!row.subscription_id||subscription){start=session.Start_Date??session.start_date;end=session.End_Date??session.end_date;}
    }
    return {...row,coverage_start:Number(start)||null,coverage_end:Number(end)||null};
   });
  }
  function labEligibility(studentId, lab, {actorId,enrollments=[],cart=[]}) {
   const start=Number(lab.coverage_start??lab.start_date),end=Number(lab.coverage_end??lab.end_date);
   if(!(start>0&&end>=start))return false;
   const covers=r=>Number(r.coverage_start)>0&&Number(r.coverage_start)<=start&&Number(r.coverage_end)>=end;
   return enrollments.some(r=>r.parent_user_id===actorId&&r.student_id===studentId&&r.status==='Active'&&isQualifyingPlayers(r)&&covers(r))||
    cart.some(i=>i.student_id===studentId&&i.will_be_active===true&&isQualifyingPlayers(i)&&covers(i));
  }
  // Payment options are derived from assigned catalog fields, never legacy recurring prices.
  // Summer retains its current package/deposit flow without offering payment plans.
  function paymentOptions(session) {
   if(session.program_id===13)return ['full'];
   if(Array.isArray(session.payment_options))return PAYMENT_PREFERENCES.filter(p=>session.payment_options.includes(p));
   return ['full',...(session.semester?.price_id?['semester']:[]),...(session.deposit?.price_id?['monthly']:[])];
  }
  function quoteFamily(request,{actorId,students,sessions,coupons,enrollments=[],now=Date.now()}){
   requireValue(Array.isArray(request.items)&&request.items.length>0&&request.items.length<=30,'ITEMS_REQUIRED','Add at least one student and session.');
   const aidPercent=Number(request.aid_percent??0);requireValue(AID_RATES.includes(aidPercent),'INVALID_AID','Choose an available financial aid percentage.');
   const selected=request.items.map(input=>{requireValue(positiveId(input.student_id)&&positiveId(input.session_id),'INVALID_ITEM','Select a student and session for every row.');const student=students.find(s=>s.id===Number(input.student_id)&&s.parent_user_id===actorId),session=sessions.find(s=>s.id===Number(input.session_id)&&[1,3,10,13].includes(s.program_id)&&(!s.add_on||isLab(s))&&!s.draft&&!s.archived);requireValue(student&&['Approved','Pending'].includes(student.Status),'STUDENT_UNAVAILABLE','A selected student is unavailable.',403);requireValue(session,'SESSION_UNAVAILABLE','A selected session is unavailable.');return {student,session};});
   const planned=selected.filter(({session})=>paymentOptions(session).length>1),regular=planned.length>0,preference=regular?request.payment_preference:null;
   requireValue(!regular||PAYMENT_PREFERENCES.includes(preference),'PAYMENT_PREFERENCE','Choose how you would like to pay before continuing.');
   requireValue(!regular||planned.every(({session})=>paymentOptions(session).includes(preference)),'PAYMENT_UNAVAILABLE','This payment option is not available for every selected item with payment plans. Choose another option.',409);
   const seen=new Set();const validPrice=p=>p?.price_id&&p?.product_id&&Number.isSafeInteger(p.cents)&&p.cents>0&&p.active===true&&p.currency==='usd'&&p.type==='one_time';
   const items=selected.map(({student,session})=>{
    const key=`${student.id}:${session.id}`;requireValue(!seen.has(key),'DUPLICATE_ITEM','This student and session are already in your registration.');seen.add(key);
    requireValue(!enrollments.some(e=>e.student_id===student.id&&e.session_id===session.id&&['Active','Pending','Waitlist','Paused'].includes(e.status)),'ALREADY_REGISTERED','This student already has a registration for this session. Contact Chickenshed NYC about changes or later semester payments.',409);
    const lab=isLab(session),paymentPreference=paymentOptions(session).length>1?preference:'full',coverage=coverageFor(session,paymentPreference,now),tuition=paymentPreference==='semester'?session.semester:session.tuition;
    requireValue(validPrice(tuition),'CATALOG_INVALID','Pricing is temporarily unavailable for this session.',503);
    const tuitionCents=tuition.cents,lineAid=aidPercent,aidCents=Math.round(tuitionCents*lineAid/100),net=tuitionCents-aidCents;
    const pending=student.Status==='Pending',monthly=paymentPreference==='monthly',deposit=pending&&Boolean(session.deposit?.price_id)||monthly;
    requireValue(!deposit||(validPrice(session.deposit)&&tuition.product_id!==session.deposit.product_id),'DEPOSIT_UNAVAILABLE','The assigned deposit price needs to be configured for this session. Please contact Chickenshed NYC.',503);
    const gross=deposit?session.deposit.cents:tuitionCents,discount=deposit?0:aidCents,due=gross-discount;
    requireValue(net>=due,'CATALOG_INVALID','Please contact Chickenshed NYC about this session’s deposit.',503);
    return {student_id:student.id,student_name:student.full_name,student_status:student.Status,session_id:session.id,package_name:session.name,session_time:session.time||'',program_id:session.program_id,program_name:session.program_name,workshop_name:session.workshop_name||'',workshop_id:session.workshop_id,registration_kind:lab?'lab':'program',payment_preference:paymentPreference,coverage_key:coverage.key,coverage_label:coverage.label,coverage_start:coverage.start||null,coverage_end:coverage.end||null,tuition_period:coverage.period,deposit_reason:!deposit?null:pending?(monthly?'review_and_monthly':'student_review'):(monthly?'monthly':null),tuition_product:tuition.product_id,tuition_price:tuition.price_id,deposit_product:session.deposit?.product_id||null,deposit_price:session.deposit?.price_id||null,payment_option:deposit?'deposit':'full',aid_percent:lineAid,tuition_cents:tuitionCents,aid_cents:aidCents,net_tuition_cents:net,checkout_gross_cents:gross,checkout_discount_cents:discount,due_now_cents:due,paid_cents:0,balance_after_checkout_cents:net-due,charge_price:deposit?session.deposit.price_id:tuition.price_id,charge_product:deposit?session.deposit.product_id:tuition.product_id};
   }).sort((a,b)=>a.student_id-b.student_id||a.session_id-b.session_id);
   const cart=items.map(i=>({...i,will_be_active:i.student_status==='Approved'}));
   for(const item of items.filter(isLab))requireValue(labEligibility(item.student_id,item,{actorId,enrollments,cart}),'LAB_ELIGIBILITY','Labs require this student to have an Active Players 2, 3 or 4 registration covering the Lab’s dates. You may add a qualifying Players registration for an Approved student in this checkout.',409);
   const effectiveAid=aidPercent;
   const sum=f=>items.reduce((n,i)=>n+i[f],0),totals=Object.fromEntries(['tuition_cents','aid_cents','net_tuition_cents','checkout_gross_cents','checkout_discount_cents','due_now_cents','balance_after_checkout_cents'].map(f=>[f,sum(f)]));
   const lines=new Map();for(const item of items){const line=lines.get(item.charge_price)||{price:item.charge_price,product:item.charge_product,quantity:0,amount_subtotal:0,amount_discount:0,amount_total:0};line.quantity++;line.amount_subtotal+=item.checkout_gross_cents;line.amount_discount+=item.checkout_discount_cents;line.amount_total+=item.due_now_cents;lines.set(line.price,line);}
   let couponId=null;if(totals.checkout_discount_cents>0){const coupon=coupons.find(c=>c.percent_off===aidPercent),eligible=[...new Set(sessions.flatMap(s=>[s.tuition?.product_id,s.semester?.product_id]).filter(Boolean))].sort();requireValue(coupon?.valid&&coupon.duration==='once'&&Array.isArray(coupon.products)&&JSON.stringify([...coupon.products].sort())===JSON.stringify(eligible),'AID_UNAVAILABLE','Financial aid pricing is temporarily unavailable.',503);couponId=coupon.id;}
   return {policy:POLICY,currency:'usd',payment_preference:preference,aid_percent:effectiveAid,items,totals,lines:[...lines.values()].sort((a,b)=>a.price.localeCompare(b.price)),coupon_id:couponId};
  }
  function quoteIdentity(q){return JSON.stringify({policy:q.policy,preference:q.payment_preference,coupon:q.coupon_id,items:q.items.map(i=>[i.student_id,i.session_id,i.student_status,i.tuition_price,i.deposit_price,i.payment_preference,i.coverage_key,i.coverage_start,i.coverage_end,i.workshop_id,i.payment_option,i.aid_percent,i.tuition_cents,i.aid_cents,i.net_tuition_cents,i.checkout_gross_cents,i.checkout_discount_cents,i.due_now_cents,i.balance_after_checkout_cents])});}
  
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
      session.metadata.quote_version === String(order.quote_version) &&
      (order.stripe_customer_id?session.customer===order.stripe_customer_id:
        order.reservation_payload?.customer_creation==='always'?(/^cus_[A-Za-z0-9_]+$/.test(session.customer||'')||!isSettledSession(session)&&session.customer===null):session.customer===null) &&
      (!order.checkout_session_id || order.checkout_session_id === session.id),
    'PAYMENT_MISMATCH', 'Payment details need staff review.', 409);
    const promotions = order.reservation_payload?.allow_promotion_codes === true && order.quote.aid_percent === 0;
    if (promotions) {
      const expected = [...order.quote.lines].sort((a,b)=>a.price.localeCompare(b.price));
      const actual = [...session.line_items].sort((a,b)=>a.price.localeCompare(b.price));
      requireValue(actual.length === expected.length && actual.every((line,index)=>{
        const baseline=expected[index];
        return line.price===baseline.price && line.product===baseline.product && line.quantity===baseline.quantity &&
          line.amount_subtotal===baseline.amount_subtotal && integer(line.amount_discount) &&
          line.amount_discount<=line.amount_subtotal && line.amount_total===line.amount_subtotal-line.amount_discount;
      }) && session.amount_subtotal===order.quote.totals.checkout_gross_cents &&
        session.amount_subtotal===actual.reduce((n,l)=>n+l.amount_subtotal,0) &&
        session.amount_total===actual.reduce((n,l)=>n+l.amount_total,0) &&
        session.total_details.amount_discount===actual.reduce((n,l)=>n+l.amount_discount,0),
      'PAYMENT_MISMATCH','Payment discount needs staff review.',409);
      return;
    }
    requireValue(session.amount_total === order.quote.totals.due_now_cents &&
      session.amount_subtotal === order.quote.totals.checkout_gross_cents &&
      session.total_details.amount_discount === order.quote.totals.checkout_discount_cents,
    'PAYMENT_MISMATCH', 'Payment amount needs staff review.', 409);
    const norm = rows => rows.map(({price,product,quantity,amount_subtotal,amount_discount,amount_total})=>
      [price,product,quantity,amount_subtotal,amount_discount,amount_total]).sort((a,b)=>a[0].localeCompare(b[0]));
    requireValue(JSON.stringify(norm(session.line_items)) === JSON.stringify(norm(order.quote.lines)),
      'PAYMENT_MISMATCH', 'Payment items need staff review.', 409);
  }
  function isSettledSession(session) {
    return session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required';
  }
  function settlementQuote(order,session) {
    validateCanonical(order,session);
    const quote=JSON.parse(JSON.stringify(order.quote));
    if (!(order.reservation_payload?.allow_promotion_codes===true && quote.aid_percent===0)) return quote;
    const discount=session.total_details.amount_discount;
    if (!discount || quote.promotion_discount_cents===discount) return quote;
    for (const line of session.line_items) {
      const items=quote.items.filter(item=>item.charge_price===line.price);
      requireValue(items.length===line.quantity,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
      const each=Math.floor(line.amount_discount/items.length),remainder=line.amount_discount%items.length;
      items.forEach((item,index)=>{
        const amount=each+(index<remainder?1:0);
        requireValue(amount<=item.due_now_cents,'PAYMENT_MISMATCH','Payment allocation needs staff review.',409);
        item.promotion_discount_cents=amount;
        item.checkout_discount_cents+=amount;
        item.due_now_cents-=amount;
        item.net_tuition_cents-=amount;
      });
    }
    quote.lines=JSON.parse(JSON.stringify(session.line_items));
    quote.promotion_discount_cents=discount;
    quote.totals.promotion_discount_cents=discount;
    quote.totals.checkout_discount_cents=discount;
    quote.totals.due_now_cents=session.amount_total;
    quote.totals.net_tuition_cents-=discount;
    return quote;
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
      requireValue(typeof key === 'string' && /^(rk|sk)_live_/.test(key), 'PAYMENT_SETUP_REQUIRED', 'Registration payment setup is incomplete.', 503);
      this.key=key;this.fetcher=fetcher;
    }
    async request(action,id,params={},idempotencyKey) {
      const safeId = typeof id === 'string' && /^[a-zA-Z0-9_]+$/.test(id);
      const routes = {
        price:['GET',`/v1/prices/${safeId?id:''}`],product:['GET',`/v1/products/${safeId?id:''}`],
        coupon:['GET',`/v1/coupons/${safeId?id:''}`],session:['GET',`/v1/checkout/sessions/${safeId?id:''}`],
        customer_update:['POST',`/v1/customers/${safeId?id:''}`],
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
      if(!response.ok||data.error||data.livemode===false){const error=new SummerError('STRIPE_UNAVAILABLE','Payment service is temporarily unavailable.',503);error.stripe_operation=action;error.provider_status=response.status;error.provider_code=data.error?.code||null;throw error;}
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
  
  function planSessionRegistrations(order,existing,catalog){
   if(order?.status!=='paid')return {create:[],reused:0};
   requireValue(order.checkout_policy===POLICY&&order.quote?.policy===POLICY&&order.paid_cents===order.quote.totals.due_now_cents,'REGISTRATION_LINK','These registrations need staff review.',409);
   const key=r=>`${r.student_id}:${r.session_id}`,expected=new Map(order.quote.items.map(i=>[key(i),i])),found=new Set();
   for(const row of existing){const item=expected.get(key(row));requireValue(row.registration_order_id===order.id&&row.parent_user_id===order.owner_user_id&&item&&row.program_id===item.program_id&&!row.subscription_id&&row.checkout_session_id===order.checkout_session_id&&!found.has(key(row)),'REGISTRATION_LINK','These registrations need staff review.',409);found.add(key(row));}
   const enrollments=enrollmentCoverage(catalog.enrollments||[],catalog);
   const cart=order.quote.items.map(i=>{const student=catalog.students.find(s=>s.id===i.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===i.session_id),prior=existing.find(r=>key(r)===key(i));return {...i,program_id:session?.Parent_program,workshop_id:session?.Parent_workshop,will_be_active:prior?prior.status==='Active':student?.Status==='Approved'};});
   for(const item of order.quote.items.filter(isLab)){if(found.has(key(item)))continue;const session=catalog.sessions.find(s=>s.id===item.session_id);requireValue(session?.Parent_program===10&&Number(session.Start_Date)===item.coverage_start&&Number(session.End_Date)===item.coverage_end&&labEligibility(item.student_id,item,{actorId:order.owner_user_id,enrollments,cart}),'LAB_ELIGIBILITY','Lab eligibility changed. Payment is recorded and staff must review this registration.',409);}
   const create=[];for(const item of order.quote.items){if(found.has(key(item)))continue;const student=catalog.students.find(s=>s.id===item.student_id&&s.parent_user_id===order.owner_user_id),session=catalog.sessions.find(s=>s.id===item.session_id&&s.Parent_program===item.program_id),workshop=catalog.workshops.find(w=>w.id===session?.Parent_workshop),location=catalog.locations.find(l=>l.id===session?.Location);requireValue(student&&session&&[1,3,10,13].includes(item.program_id)&&['Approved','Pending'].includes(student.Status)&&item.paid_cents===item.due_now_cents,'REGISTRATION_LINK','A student or session needs staff review.',409);const status=student.Status==='Approved'?'Active':'Pending';create.push({registration_order_id:order.id,status,update_status:status,student_id:item.student_id,parent_user_id:order.owner_user_id,session_id:item.session_id,program_id:item.program_id,program_name:item.program_name,subscription_id:null,workshop_id:session.Parent_workshop||null,workshop_name:workshop?.Name||item.workshop_name||'',weekday:session.Weekday||'',time_block:session.Time_block||'',location_id:session.Location||null,location:location?.Name||'',product_id:session.Tuition_product,update_product_id:session.Tuition_product,checkout_session_id:order.checkout_session_id,move_to:null});}
   return {create,reused:found.size};
  }
  
  
  function referenceFor(actorId,attempt) {
    requireValue(Number.isSafeInteger(actorId)&&actorId>0&&typeof attempt==='string'&&/^[-a-zA-Z0-9_]{16,80}$/.test(attempt),
      'ATTEMPT_REQUIRED','Please refresh your registration and try again.',400);
    return `registration_${actorId}_${attempt}`;
  }
  function publicReceipt(order) {return {order_id:order.id,status:order.status,paid_cents:order.paid_cents||0,payment_preference:order.payment_preference,covered_terms:order.covered_terms,billing_followup:order.billing_followup,items:order.quote.items,totals:order.quote.totals};}
  const unchanged = result => ({ok:true,write:'none',result});
  const update = (data,result) => ({ok:true,write:'edit',data,result});
  function registrationSuccessUrl(origin, sessionId = '{CHECKOUT_SESSION_ID}') {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const path = '/checkout-success/registration-order';
    return `${origin}${path}?session_id=${sessionId === '{CHECKOUT_SESSION_ID}' ? sessionId : encodeURIComponent(sessionId)}`;
  }
  function resultFor(order,origin) {return {action:order.status==='paid'?'done':'inspect',order,
    response:{order_id:order.id,status:order.status,url:order.status==='paid'?registrationSuccessUrl(origin,order.checkout_session_id):order.checkout_url}};}
  function reservation(actor,request,quote,reference,version,origin,now) {
    requireValue(['https://www.chickenshednyc.org'].includes(origin),
      'ENVIRONMENT','Registration return URLs are not configured.',503);
    const metadata={checkout_policy:POLICY,order_reference:reference,quote_version:String(version)};
    const payload={mode:'payment',payment_method_types:['card'],line_items:quote.lines.map(({price,quantity})=>({price,quantity})),metadata,
      payment_intent_data:{metadata,receipt_email:actor.email,setup_future_usage:'off_session'},success_url:registrationSuccessUrl(origin),
      cancel_url:`${origin}/program-registration`,expires_at:Math.floor(now/1000)+1800};
    if(actor.stripe_customer_id)payload.customer=actor.stripe_customer_id;else {payload.customer_email=actor.email;payload.customer_creation='always';}
    if(quote.coupon_id)payload.discounts=[{coupon:quote.coupon_id}];
    if(quote.aid_percent===0)payload.allow_promotion_codes=true;
    return {owner_user_id:actor.id,parent_email:actor.email,balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,attempt_key:actor.id+':'+request.attempt_id,order_reference:reference,quote_version:version,
      payment_preference:quote.payment_preference||'full',covered_terms:[...new Set(quote.items.map(i=>i.coverage_label))].join('; '),billing_followup:quote.items.some(i=>i.balance_after_checkout_cents>0||i.payment_preference==='semester')?'Needs arrangement':'Not required',status:'creating',checkout_policy:POLICY,quote_fingerprint:quoteIdentity(quote),quote,aid_intake:validateAidIntake(quote.aid_percent,request.aid_data),
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
        const result={action:'inspect',order:old,fingerprint,upgrade_promotions:quote.aid_percent===0&&old.reservation_payload?.allow_promotion_codes!==true};
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
      data.previous_checkouts=old?[...(old.previous_checkouts||[]),{session_id:old.checkout_session_id,version:old.quote_version,quote:old.quote,allow_promotion_codes:old.reservation_payload?.allow_promotion_codes===true}]:[];
      return {ok:true,write:old?'edit':'add',data,result:{action:'create'}};
    }
    requireValue(old&&old.checkout_policy===POLICY,'ORDER_NOT_READY','Order not ready; retry the event.',409);
    if(phase==='attach'||phase==='event') {
      const session=args.session;
      const previous=(old.previous_checkouts||[]).find(p=>p.session_id===session?.id);
      if(phase==='event'&&previous) {
        validateCanonical({...old,checkout_session_id:previous.session_id,quote_version:previous.version,quote:previous.quote,reservation_payload:{allow_promotion_codes:previous.allow_promotion_codes===true}},session);
        if(isSettledSession(session))return update({status:'review',review_reason:'RETIRED_CHECKOUT_PAID',
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        return unchanged({ignored:true,applied:false});
      }
      try{validateCanonical(old,session);}catch(error){
        if(isSettledSession(session)&&old.status!=='paid')return update({status:'review',review_reason:error.code,
          observed_payment_cents:session.amount_total,observed_payment_intent_id:session.payment_intent},{error:'Payment needs staff review.',applied:false});
        throw error;
      }
      if(old.status==='paid')return unchanged({...resultFor(old,origin),applied:false});
      if(isSettledSession(session)) {
        requireValue(session.status==='complete' && (session.payment_status==='paid' && session.amount_total>0 && session.payment_intent ||
          isSettledSession(session) && session.amount_total===0 && !session.payment_intent),
        'PAYMENT_PENDING','Payment is still processing.',409);
        const quote=settlementQuote(old,session);quote.items.forEach(i=>{i.paid_cents=i.due_now_cents;});
        return update({status:'paid',checkout_session_id:session.id,checkout_url:null,session_snapshot:session,quote,
          balance_after_checkout_cents:quote.totals.balance_after_checkout_cents,
          item_summary:quote.items.map(i=>`${i.student_name} | ${i.package_name} | ${i.payment_option} $${(i.due_now_cents/100).toFixed(2)}${i.promotion_discount_cents?' | coupon $'+(i.promotion_discount_cents/100).toFixed(2):''} | balance $${(i.balance_after_checkout_cents/100).toFixed(2)}`).join('\n'),
          stripe_customer_id:session.customer||old.stripe_customer_id||null,paid_cents:session.amount_total,payment_intent_id:session.payment_intent,paid_at:now,
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
  
  // Stripe stores the card. This helper sees only canonical Stripe IDs and never card numbers/CVC.
  async function saveFamilyPaymentMethod(order,client){
   requireValue(order?.checkout_policy===POLICY&&order.status==='paid','PAYMENT_METHOD_ORDER','A confirmed registration is required.');
   if(!order.payment_intent_id||!order.paid_cents)return {saved:false,reason:'no_payment_collected',default_changed:false};
   const s=await client.request('session',order.checkout_session_id,{expand:['customer','payment_intent.payment_method']});
   const customer=s.customer,pi=s.payment_intent,method=pi?.payment_method;
   requireValue(s.livemode===true&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.checkout_policy===POLICY&&s.metadata.order_reference===order.order_reference&&s.metadata.quote_version===String(order.quote_version)&&customer?.id===order.stripe_customer_id&&pi?.id===order.payment_intent_id&&pi.setup_future_usage==='off_session'&&method?.customer===customer.id&&method.type==='card','PAYMENT_METHOD_MISMATCH','The saved payment method needs staff review.');
   const previous=customer.invoice_settings?.default_payment_method;
   // Existing subscription/customer defaults remain intact. A first saved card becomes the
   // default for staff-created invoices; staff can select another saved card when arranging payments.
   if(previous)return {saved:true,default_changed:false,existing_default_preserved:true};
   const updated=await client.request('customer_update',customer.id,{invoice_settings:{default_payment_method:method.id}},order.order_reference+':default_payment_method');
   requireValue(updated.id===customer.id&&updated.invoice_settings?.default_payment_method===method.id,'PAYMENT_METHOD_UNAVAILABLE','The saved card is attached, but its default setting needs staff review.');
   return {saved:true,default_changed:true,existing_default_preserved:false};
  }
  
  try { const p=$var.plan,o=p.order;requireValue(!p.error,'PAYMENT_MISMATCH','Payment needs staff review.',409);return {ok:true,order_id:o.id,status:o.status,url:o.status==='paid'?registrationSuccessUrl($var.prepared.args.origin,o.checkout_session_id):o.checkout_url}; } catch(e) { return {ok:false,code:e.code||'SUMMER_UNAVAILABLE',message:e.code?e.message:'Registration service is temporarily unavailable.'}; }
  """
 timeout = 30
} as $result
precondition ($result.ok === true) { error = "Payment needs staff review." }
 }
 response = $result
}