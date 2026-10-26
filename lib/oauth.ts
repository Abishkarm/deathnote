export function base64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export async function createPkce(){const verifier=base64url(crypto.getRandomValues(new Uint8Array(32)));const challenge=base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));return{verifier,challenge};}
export function validVerifier(value:string|undefined){return !!value&&/^[A-Za-z0-9_-]{43}$/.test(value);}
