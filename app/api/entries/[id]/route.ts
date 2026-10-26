import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in first.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
 const {id}=await params;const row=await env.DB!.prepare('SELECT photo FROM entries WHERE id=? AND owner=?').bind(id,user.userId).first();if(!row)return Response.json({error:'Entry not found.'},{status:404});
 await env.DB!.prepare('DELETE FROM entries WHERE id=? AND owner=?').bind(id,user.userId).run();if(row.photo)await env.BUCKET!.delete(String(row.photo));return Response.json({ok:true});
}
