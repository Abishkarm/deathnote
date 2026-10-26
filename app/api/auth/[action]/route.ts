import {cookies} from 'next/headers';
import {authConfig,authRequest,json,sameOrigin,sessionResponse,clearSession} from '../../../supabase-auth';
import {createPkce,validVerifier} from '@/lib/oauth';
function redirect(request:Request,error?:string){const target=new URL('/',request.url);if(error)target.searchParams.set('auth_error',error);return new Response(null,{status:303,headers:{Location:target.href,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}
function clearPkce(response:Response,request:Request){response.headers.append('Set-Cookie',`dn_pkce=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0${new URL(request.url).protocol==='https:'?'; Secure':''}`);return response;}
export async function GET(request:Request,{params}:{params:Promise<{action:string}>}){
 const{action}=await params;const config=authConfig();
 if(!['google','callback'].includes(action))return json({error:'Not found.'},404);
 if(!config)return redirect(request,'setup');
 if(action==='google'){
  try{
   const response=await authRequest('settings');if(!response.ok)return redirect(request,'configuration');
   const settings=await response.json() as {external?:{google?:boolean}};if(!settings.external?.google)return redirect(request,'google_disabled');
   const{verifier,challenge}=await createPkce();const authorize=new URL(config.url+'/auth/v1/authorize');authorize.searchParams.set('provider','google');authorize.searchParams.set('redirect_to',new URL('/api/auth/callback',request.url).href);authorize.searchParams.set('code_challenge',challenge);authorize.searchParams.set('code_challenge_method','s256');
   const result=new Response(null,{status:303,headers:{Location:authorize.href,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});result.headers.append('Set-Cookie',`dn_pkce=${verifier}; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=600${new URL(request.url).protocol==='https:'?'; Secure':''}`);return result;
  }catch{return redirect(request,'unavailable');}
 }
 const url=new URL(request.url),code=url.searchParams.get('code'),verifier=(await cookies()).get('dn_pkce')?.value;
 if(url.searchParams.has('error'))return clearPkce(redirect(request,'cancelled'),request);
 if(!code||code.length>2048||!validVerifier(verifier))return clearPkce(redirect(request,'expired'),request);
 try{const response=await authRequest('token?grant_type=pkce',{auth_code:code,code_verifier:verifier});if(!response.ok)return clearPkce(redirect(request,'expired'),request);const data=await response.json() as {access_token:string;refresh_token:string;expires_in:number};if(!data.access_token||!data.refresh_token)return clearPkce(redirect(request,'unavailable'),request);const session=sessionResponse(request,data);const result=redirect(request);for(const cookie of session.headers.getSetCookie())result.headers.append('Set-Cookie',cookie);return clearPkce(result,request);}catch{return clearPkce(redirect(request,'unavailable'),request);}
}
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 const{action}=await params;
 if(action==='otp'||action==='verify')return json({error:'Email codes have been replaced by Google sign-in.'},410);
 if(action==='logout'){const access=(await cookies()).get('dn_access')?.value;if(access){try{await authRequest('logout',{},access)}catch{}}return clearPkce(clearSession(request),request);}
 if(action!=='refresh')return json({error:'Not found.'},404);
 if(!authConfig())return json({error:'Sign-in is not configured yet.'},503);
 const token=(await cookies()).get('dn_refresh')?.value;if(!token)return json({error:'Sign in to continue.'},401);
 try{const r=await authRequest('token?grant_type=refresh_token',{refresh_token:token});if(!r.ok)return clearSession(request);const data=await r.json() as {access_token:string;refresh_token:string;expires_in:number};if(!data.access_token||!data.refresh_token)return json({error:'Sign in again.'},401);return sessionResponse(request,data);}catch{return json({error:'Sign-in is temporarily unavailable.'},503);}
}
