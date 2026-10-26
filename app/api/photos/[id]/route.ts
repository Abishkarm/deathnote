import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getChatGPTUser();if(!user)return new Response('Unauthorized',{status:401});const {id}=await params;
 const row=await env.DB!.prepare('SELECT photo FROM entries WHERE id=? AND owner=?').bind(id,user.userId).first();if(!row?.photo)return new Response('Not found',{status:404});
 const file=await env.BUCKET!.get(String(row.photo));if(!file)return new Response('Not found',{status:404});
 return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
