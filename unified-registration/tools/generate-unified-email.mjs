import{readFile,writeFile}from'node:fs/promises';
let s=await readFile(new URL('./generate-xano-email.mjs',import.meta.url),'utf8');
s=s.replace('../xano/summer-sandbox/function/','../xano/sandbox/function/').replace("'../src/'+n+'.mjs'","'../test-model/'+n+'.mjs'").replaceAll('summer_','registration_').replaceAll('Summer ','Registration ');
s=s.replace('function.run registration_bridge_fixture_guard { input = {} } as $guard\n ${lambda(', 'function.run registration_bridge_fixture_guard { input = {} } as $guard\n function.run registration_save_payment_method_v1 { input = {order_id:$input.order_id} } as $saved_payment_method\n ${lambda(');
s=s.replaceAll('registration_bridge_fixture_guard','summer_bridge_fixture_guard').replaceAll('registration_confirmation_min_order_id','summer_confirmation_min_order_id').replaceAll('registration_confirmation_email_enabled','summer_confirmation_email_enabled');
let template='UNIFIED_TEMPLATE_NOT_CONFIGURED';try{template=JSON.parse(await readFile(new URL('../evidence/unified-email-template.json',import.meta.url),'utf8')).template_id;}catch{}
if(template!=='UNIFIED_TEMPLATE_NOT_CONFIGURED'&&!/^d-[a-f0-9]{32}$/.test(template))throw Error('Unexpected template identifier');
s=s.replaceAll('d-71675df1534941f6b62ad88f59aac3ce',template).replace("enabled:$env.summer_confirmation_email_enabled==='true'",`enabled:$env.summer_confirmation_email_enabled==='true'&&${template.startsWith('d-')}`);
await writeFile(new URL('./.run-unified-email.mjs',import.meta.url),s);await import('./.run-unified-email.mjs');
