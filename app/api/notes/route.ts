import {env} from 'cloudflare:workers';
import {getUser,json,sameOrigin} from '../../supabase-auth';
import {noteStates} from '@/lib/note-policy';
export async function GET(request:Request){
 const view=new URL(request.url).searchParams.get('view')||'public';const user=await getUser();
 if(view==='mine'&&!user)return json({error:'Sign in to see your notes.'},401);
 if(view==='admin'&&!user?.isAdmin)return json({error:'Admin access required.'},403);
 if(!['public','mine','admin'].includes(view))return json({error:'Unknown view.'},400);
 const sql=view==='mine'?'SELECT * FROM notes WHERE owner=? ORDER BY updated DESC LIMIT 200':'SELECT * FROM notes WHERE status=\'published\' ORDER BY updated DESC LIMIT 200';
 const statement=env.DB!.prepare(sql);const data=await (view==='mine'?statement.bind(user!.id):statement).all();
 return json({notes:data.results.map(({owner,...note})=>({...note,canEdit:owner===user?.id,canModerate:!!user?.isAdmin&&note.status==='published'}))});
}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 const user=await getUser();if(!user)return json({error:'Sign in to write a note.'},401);
 if(Number(request.headers.get('content-length')||0)>64000)return json({error:'Note is too long.'},413);
 let body;try{body=await request.json() as Record<string,unknown>}catch{return json({error:'Send a text note as JSON.'},400)}
 const title=String(body.title||'').trim(),authorName=String(body.authorName||'').trim(),recipient=String(body.recipient||'').trim(),content=String(body.body||'').trim(),status=String(body.status||'draft');
 if(!title||title.length>160||authorName.length>100||recipient.length>120||!content||content.length>12000||!noteStates.includes(status as typeof noteStates[number]))return json({error:'Add a title and note, and check the field lengths.'},400);
 if(status==='published'&&body.confirmPublic!==true)return json({error:'Confirm that you want this note to be public.'},400);
 const id=body.id?String(body.id):crypto.randomUUID();const now=Date.now();
 if(body.id){const old=await env.DB!.prepare('SELECT id FROM notes WHERE id=? AND owner=?').bind(id,user.id).first();if(!old)return json({error:'Note not found.'},404);await env.DB!.prepare('UPDATE notes SET title=?,authorName=?,recipient=?,body=?,status=?,updated=? WHERE id=? AND owner=?').bind(title,authorName,recipient,content,status,now,id,user.id).run();}
 else await env.DB!.prepare('INSERT INTO notes (id,owner,title,authorName,recipient,body,status,created,updated) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,user.id,title,authorName,recipient,content,status,now,now).run();
 return json({id},body.id?200:201);
}
