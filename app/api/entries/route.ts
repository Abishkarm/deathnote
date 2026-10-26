import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'Sign in to open your notebook.'},401);
 const result=await env.DB!.prepare('SELECT id,name,alias,universe,details,kind,photo,created,updated FROM entries WHERE owner=? ORDER BY updated DESC').bind(user.userId).all();return json({entries:result.results});
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Sign in first.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
 if(Number(request.headers.get('content-length')||0)>5_400_000)return json({error:'Upload must be below 5 MB.'},413);
 const f=await request.formData();const name=String(f.get('name')||'').trim(),alias=String(f.get('alias')||'').trim(),universe=String(f.get('universe')||'').trim(),details=String(f.get('details')||'').trim(),kind=String(f.get('kind')||'');
 if(!name||name.length>100||alias.length>100||universe.length>100||details.length>4000||!['fictional','consenting'].includes(kind)||f.get('consent')!=='yes')return json({error:'Check your name, subject type, and permission confirmation.'},400);
 const oldId=String(f.get('id')||'');const old=oldId?await env.DB!.prepare('SELECT * FROM entries WHERE id=? AND owner=?').bind(oldId,user.userId).first():null;
 if(oldId&&!old)return json({error:'Entry not found.'},404);
 const id=oldId||crypto.randomUUID();let photo=(old?.photo as string|null)||null;let newPhoto:string|null=null;const file=f.get('photo');
 if(file instanceof File&&file.size){
  if(file.size>5_000_000)return json({error:'Photo must be below 5 MB.'},413);
  const bytes=new Uint8Array(await file.arrayBuffer());const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(!jpeg&&!png&&!webp)return json({error:'Use a JPG, PNG, or WebP photo.'},400);
  newPhoto=`photos/${crypto.randomUUID()}`;await env.BUCKET!.put(newPhoto,bytes,{httpMetadata:{contentType:jpeg?'image/jpeg':png?'image/png':'image/webp'}});photo=newPhoto;
 }
 if(f.get('removePhoto')==='yes'&&!newPhoto)photo=null;const now=Date.now();
 try{if(old)await env.DB!.prepare('UPDATE entries SET name=?,alias=?,universe=?,details=?,kind=?,photo=?,updated=? WHERE id=? AND owner=?').bind(name,alias,universe,details,kind,photo,now,id,user.userId).run();else await env.DB!.prepare('INSERT INTO entries (id,owner,name,alias,universe,details,kind,photo,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,user.userId,name,alias,universe,details,kind,photo,now,now).run();}catch(error){if(newPhoto)await env.BUCKET!.delete(newPhoto);throw error;}
 if(old?.photo&&old.photo!==photo)await env.BUCKET!.delete(String(old.photo));return json({id},old?200:201);
}
