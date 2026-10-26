import assert from 'node:assert/strict';
import {isVerifiedAdmin,canManageNote} from '../lib/note-policy.ts';
const adminEmail='owner@example.test';
assert.equal(isVerifiedAdmin({id:'x',email:adminEmail},adminEmail),false);
assert.equal(isVerifiedAdmin({id:'x',email:'other@example.test',email_confirmed_at:'2026-01-01'},adminEmail),false);
assert.equal(isVerifiedAdmin({id:'x',email:adminEmail,email_confirmed_at:'2026-01-01'},adminEmail),true);
assert.equal(canManageNote({owner:'other',status:'hidden'},{id:'admin',isAdmin:true}),false);
assert.equal(canManageNote({owner:'other',status:'draft'},{id:'admin',isAdmin:true}),false);
assert.equal(canManageNote({owner:'other',status:'published'},{id:'admin',isAdmin:true}),true);
assert.equal(canManageNote({owner:'other',status:'published'},{id:'viewer',isAdmin:false}),false);
assert.equal(canManageNote({owner:'author',status:'draft'},{id:'author',isAdmin:false}),true);
console.log('PASS: verified admin identity and private-note moderation boundaries.');
if(process.argv[2]){
 const base=process.argv[2];const api=(path,opts={})=>fetch(base+path,opts);
 const r=await api('/api/notes');assert.equal(r.status,200);const {notes}=await r.json();assert.ok(notes.every(n=>n.status==='published'));assert.ok(notes.some(n=>n.id==='qa-public-note-20261026'),'Published fixture is visible');assert.ok(!notes.some(n=>n.id==='qa-draft-note-20261026'||n.id==='qa-hidden-note-20261026'),'Private fixtures are absent');assert.ok(notes.every(n=>!('owner' in n)));
 assert.equal((await api('/api/notes?view=mine')).status,401);
 assert.equal((await api('/api/notes?view=admin')).status,403);
 assert.equal((await api('/api/notes',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,401);
 assert.equal((await api('/api/photos/test')).status,410);
 assert.equal((await api('/api/entries',{method:'POST'})).status,410);
 assert.equal((await api('/api/auth/otp',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.test'})})).status,503);
 const session=await (await api('/api/auth/session')).json();assert.equal(session.user,null);assert.equal(session.configured,false);
 console.log('PASS: public-only note listing, private/admin access guards, removed uploads, and fail-closed unconfigured sign-in.');
}

