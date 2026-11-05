const names=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
export function orderedRegistrationOptions(options){return [...options].sort((a,b)=>names.compare(a.label||'',b.label||''));}
export function selectableRegistrationSessions(sessions,now=Date.now()){return sessions.filter(session=>{const end=Number(session.end_date);return !Number.isFinite(end)||end<=0||end>=now;});}
