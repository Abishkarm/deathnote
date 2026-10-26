import {cookies} from 'next/headers';
import {authConfig,authRequest,json,sameOrigin,sessionResponse,clearSession} from '../../../supabase-auth';
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 const {action}=await params;
 if(action==='logout'){const access=(await cookies()).get('dn_access')?.value;if(access){try{await authRequest('logout',{},access)}catch{}}return clearSession(request);}
 if(!authConfig())return json({error:'Sign-in is not connected yet. The owner needs to configure Supabase.'},503);
 if(Number(request.headers.get('content-length')||0)>3000)return json({error:'Request too large.'},413);
 try{
  const body=action==='refresh'?{}:await request.json() as {email?:string;token?:string};
  if(action==='refresh'){const token=(await cookies()).get('dn_refresh')?.value;if(!token)return json({error:'Sign in to continue.'},401);const r=await authRequest('token?grant_type=refresh_token',{refresh_token:token});if(!r.ok)return clearSession(request);const data=await r.json() as {access_token:string;refresh_token:string;expires_in:number};if(!data.access_token||!data.refresh_token)return json({error:'Sign in again.'},401);return sessionResponse(request,data);}
  const email=body.email?.trim().toLowerCase();if(!email||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid email address.'},400);
  if(action==='otp'){const r=await authRequest('otp',{email,create_user:true});if(!r.ok)return json({error:r.status===429?'Please wait before requesting another code.':'Unable to send a code. Please try again later.'},r.status===429?429:400);return json({ok:true});}
  if(action==='verify'){if(!body.token||!/^\d{6,10}$/.test(body.token))return json({error:'Enter the code from your email.'},400);const r=await authRequest('verify',{email,token:body.token,type:'email'});if(!r.ok)return json({error:'That code is invalid or expired. Request a new one.'},400);const data=await r.json() as {access_token:string;refresh_token:string;expires_in:number};if(!data.access_token||!data.refresh_token)return json({error:'Sign-in could not be completed.'},400);return sessionResponse(request,data);}
  return json({error:'Not found.'},404);
 }catch{return json({error:'The sign-in service is temporarily unavailable.'},503);}
}
