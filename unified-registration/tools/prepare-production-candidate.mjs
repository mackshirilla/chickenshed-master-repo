// Pure local preparation. No network, credential reads, Xano import or publication.
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),source=new URL('xano/sandbox/',root),out=new URL('xano/production-candidate/',root);
const names=['context_v1','quote_context_v1','quote_v1','order_v1','stripe_session_v1','verify_event_v1','confirmation_v1','send_confirmation_v1','save_payment_method_v1'];
const mapping=Object.fromEntries(names.map(n=>['registration_'+n,'registration_live_'+n]));
const sha=s=>createHash('sha256').update(s).digest('hex');
export function productionSource(input){
 let s=input.replace(/\n\s*guid\s*=\s*"[^"]+"/g,'');
 for(const [a,b] of Object.entries(mapping))s=s.replaceAll(a,b);
 s=s.replaceAll('summer_bridge_fixture_guard','registration_orders_live_guard_v1').replaceAll('StripeTestClient','StripeLiveClient').replaceAll('sandboxReturnOrigin','registrationReturnOrigin');
 s=s.replaceAll('$env.summer_stripe_test_api_key','$env.stripe_api_secret').replaceAll('$env.summer_stripe_test_webhook_secret','$env.registration_stripe_webhook_secret').replaceAll('$env.summer_confirmation_email_enabled','$env.registration_confirmation_email_enabled');
 s=s.replaceAll('session.livemode === false','session.livemode === true').replaceAll('session?.livemode === false','session?.livemode === true').replaceAll('s.livemode===false','s.livemode===true').replaceAll('price.livemode===false','price.livemode===true').replaceAll('event.livemode!==false','event.livemode!==true').replaceAll('data.livemode===true','data.livemode===false');
 s=s.replaceAll('/^cs_test_/','/^cs_live_/').replaceAll('/^(rk|sk)_test_/','/^(rk|sk)_live_/').replaceAll('TEST_SETUP_REQUIRED','PAYMENT_SETUP_REQUIRED').replaceAll('Stripe test setup is incomplete.','Registration payment setup is incomplete.');
 s=s.replaceAll("const emailOptions={testMode:true,origin:'http://127.0.0.1:4817'};","const emailOptions={testMode:false,origin:'https://www.chickenshednyc.org'};");
 s=s.replace(/if\(emailOptions\.testMode\)requireValue\(order\.owner_user_id===1[\s\S]*?'Only the approved new test checkout can send\.'\);/,"requireValue(order.session_snapshot?.livemode===true&&order.checkout_session_id.startsWith('cs_live_'),'MAIL_ORDER','A confirmed live registration is required.');");
 s=s.replaceAll("emailOptions.testMode?'mack@bigstachedesign.com':order.parent_email",'order.parent_email').replace('test_mode:true','test_mode:false');
 s=s.replaceAll("['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io','https://www.chickenshednyc.org']","['https://www.chickenshednyc.org']").replaceAll("['http://127.0.0.1:4817','https://chickenshednyc2024.webflow.io']","['https://www.chickenshednyc.org']");
 s=s.replaceAll("const path = origin === 'https://chickenshednyc2024.webflow.io' ? '/checkout-success/registration-order' : '/registration-success-preview';","const path = '/checkout-success/registration-order';").replaceAll("const path=origin==='http://127.0.0.1:4817'?'/registration-success-preview':'/checkout-success/registration-order';","const path='/checkout-success/registration-order';");
 s=s.replaceAll("args.origin||'http://127.0.0.1:4817'","args.origin||'https://www.chickenshednyc.org'").replaceAll("origin='http://127.0.0.1:4817'","origin='https://www.chickenshednyc.org'");
 s=s.replaceAll("const staging='https://chickenshednyc2024.webflow.io'","const staging='https://www.chickenshednyc.org'").replaceAll("['http://127.0.0.1:4817',staging]",'[staging]').replaceAll('Summer sandbox return origin','Registration return origin').replaceAll('Registration sandbox return URLs','Registration return URLs');
 s=s.replaceAll('cancel_url:`${origin}/registration-preview`','cancel_url:`${origin}/program-registration`');
 s=s.replaceAll('https://chickenshednyc2024.webflow.io','https://www.chickenshednyc.org');
 s=s.replaceAll('Unified Registration Sandbox','Unified Registration').replace(/^\/\/ Isolated[^\n]*\n/gm,'// Unpublished production candidate. Runtime gate defaults closed.\n');
 if(/spgm-3uz8-a402|summer_bridge_fixture|summer_stripe_test_|unified_test_aid_|http:\/\/127\.0\.0\.1|chickenshednyc2024\.webflow\.io|cs_test_|mack@bigstachedesign\.com|summer_confirmation_min_order_id/.test(s))throw Error('Sandbox content remains in production candidate: '+s.match(/spgm-3uz8-a402|summer_bridge_fixture|summer_stripe_test_|unified_test_aid_|http:\/\/127\.0\.0\.1|chickenshednyc2024\.webflow\.io|cs_test_|mack@bigstachedesign\.com|summer_confirmation_min_order_id/)[0]);
 return s;
}
const manifest={prepared_at:new Date().toISOString(),deployed:false,production_changes:false,operation:'Local files only; do not import until release approval',functions:[],apis:[],required_environment:{registration_runtime_mode:'unset until release; live to enable runtime',registration_checkout_enabled:'unset/false; true only when ready to accept new checkout',registration_confirmation_email_enabled:'unset/false; true at coordinated release',unified_registration_enabled:'unset/false; true closes old creation endpoints at coordinated release',registration_stripe_webhook_secret:'Dedicated live unified webhook signing secret; secure placement at release',stripe_api_secret:'Existing production credential reference; never read/copied by this generator',sendgrid_api_key:'Existing production credential reference',sendgrid_from_email:'Existing verified sender reference'},origin:'https://www.chickenshednyc.org',api_base:'https://xszy-vp96-kdkh.n7c.xano.io/api:registration26/registration',schema:'../order-fields.json',legacy_guards:'../legacy-guards/manifest.json',academic_semester_dates_required:false};
await mkdir(new URL('function/',out),{recursive:true});
// Remove only the obsolete local generated guard; never overwrite the existing live helper.
try{await unlink(new URL('function/registration_live_guard_v1.xs',out));}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(new URL('api/unified_registration/',out),{recursive:true});
for(const name of Object.keys(mapping)){
 let raw=await readFile(new URL('function/'+name+'.xs',source),'utf8');let s;try{s=productionSource(raw);}catch(e){throw Error(name+': '+e.message);}const path='function/'+mapping[name]+'.xs';await writeFile(new URL(path,out),s);manifest.functions.push({path,sha256:sha(s)});
}
const guard=`// Closed by default. No provider credential is accessed before this guard.
function registration_orders_live_guard_v1 {
 input {}
 stack {
  api.lambda { code = "return $env.registration_runtime_mode === 'live';"
  timeout = 5 } as $enabled
  precondition ($enabled === true) { error_type = "accessdenied"
  error = "Program registration is not configured." }
 }
 response = {configured:true}
}
`;
await writeFile(new URL('function/registration_orders_live_guard_v1.xs',out),guard);manifest.functions.push({path:'function/registration_orders_live_guard_v1.xs',sha256:sha(guard)});
for(const name of ['start_GET.xs','quote_POST.xs','checkout_POST.xs','receipt_GET.xs','payment_events_POST.xs','account_GET.xs','resources_GET.xs']){
 let s=productionSource(await readFile(new URL('api/unified_registration/'+name,source),'utf8'));
 if(name==='checkout_POST.xs')s=s.replace('function.run registration_orders_live_guard_v1 { input = {} } as $sandbox_guard',`function.run registration_orders_live_guard_v1 { input = {} } as $sandbox_guard
 api.lambda { code = "return $env.registration_checkout_enabled === 'true';"
 timeout = 5 } as $checkout_enabled
 precondition ($checkout_enabled === true) { error_type = "accessdenied"
 error = "Program registration is not open yet." }`);
 if(name==='checkout_POST.xs'&&!s.includes('$env.registration_checkout_enabled'))throw Error('Checkout gate anchor changed');
 const path='api/unified_registration/'+name;await writeFile(new URL(path,out),s);manifest.apis.push({path,sha256:sha(s)});
}
const group=`// Unpublished production candidate. No staff API or fixture issuer is included.
api_group "Unified Registration" {
 canonical = "registration26"
 description = "Owned program orders, linked registrations, and one-time checkout."
 swagger = {active:false}
 cors = {mode:"custom",origins:["https://www.chickenshednyc.org"],methods:["GET","POST"],headers:["Content-Type","Authorization"],credentials:false,max_age:60}
}
`;
await writeFile(new URL('api/unified_registration/unified_registration.xs',out),group);
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');
const parts=await Promise.all(['quote','stripe-native','financial-aid','session-registrations','native-order','payment-method','confirmation'].map(async n=>(await readFile(new URL('test-model/'+n+'.mjs',root),'utf8')).replace(/^import .*\n/gm,'').replace(/^export /gm,'')));
await writeFile(new URL('runtime-core.mjs',out),productionSource(parts.join('\n'))+'\nexport {quoteFamily,quoteIdentity,planNativeOrder,normalizeSession,validateCanonical,StripeLiveClient,verifyNativeEvent,confirmationData,saveFamilyPaymentMethod};\n');
console.log(JSON.stringify({local_only:true,deployed:false,functions:manifest.functions.length,apis:manifest.apis.length,runtime_gate:'closed by default',checkout_gate:'closed by default'}));
