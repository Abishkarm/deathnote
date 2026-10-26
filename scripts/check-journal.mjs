import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5173';
const call=(path,options={})=>fetch(base+path,{redirect:'manual',...options});
assert.equal((await call('/api/entries')).status,401,'Anonymous notebook is protected');
assert.equal((await call('/api/entries',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof@example.test'}})).status,401,'Development proxy rejects spoofed identity');
const login=await call('/signin-with-chatgpt?return_to=%2F');
const cookie=(login.headers.get('set-cookie')||'').split(';')[0];
assert.ok(cookie,'Local sign-in creates a session');
const headers={Cookie:cookie,Origin:base};
assert.equal((await call('/api/entries',{method:'POST',headers:{Cookie:cookie,Origin:'https://invalid.example'},body:new FormData()})).status,403,'Foreign-origin mutation rejected');
const form=()=>{const f=new FormData();f.set('name','Automated fictional character');f.set('alias','Test subject');f.set('universe','QA universe');f.set('details','A fictional entry created for verification.');f.set('kind','fictional');f.set('consent','yes');return f};
const bad=form();bad.set('photo',new Blob(['<svg/>'],{type:'image/png'}),'bad.png');
assert.equal((await call('/api/entries',{method:'POST',headers,body:bad})).status,400,'Disguised SVG upload rejected');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1X8AAAAASUVORK5CYII=','base64');
const good=form();good.set('photo',new Blob([png],{type:'image/png'}),'portrait.png');
let id;
try{
 const created=await call('/api/entries',{method:'POST',headers,body:good});assert.equal(created.status,201,await created.clone().text());id=(await created.json()).id;
 const list=await call('/api/entries',{headers});assert.equal(list.status,200);assert.equal(list.headers.get('cache-control'),'private, no-store');assert.ok((await list.json()).entries.find(e=>e.id===id),'Saved entry is listed');
 const image=await call(`/api/photos/${id}`,{headers});assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.equal((await image.arrayBuffer()).byteLength,png.length);
 assert.equal((await call(`/api/photos/${id}`)).status,401,'Anonymous photo access rejected');
 const edited=form();edited.set('id',id);edited.set('name','Updated fictional character');assert.equal((await call('/api/entries',{method:'POST',headers,body:edited})).status,200);
 const after=(await (await call('/api/entries',{headers})).json()).entries.find(e=>e.id===id);assert.equal(after.name,'Updated fictional character');assert.ok(after.photo,'Edit preserves portrait');
 assert.equal((await call('/api/entries/missing',{method:'DELETE',headers})).status,404);
 assert.equal((await call(`/api/entries/${id}`,{method:'DELETE',headers})).status,200);assert.equal((await call(`/api/photos/${id}`,{headers})).status,404);id=null;
 console.log('PASS: authentication, spoof rejection, CSRF, upload validation, persistence, photo privacy, edit, and deletion.');
}finally{if(id)await call(`/api/entries/${id}`,{method:'DELETE',headers});}
