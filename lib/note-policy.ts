export type AuthIdentity={id:string;email?:string;email_confirmed_at?:string|null};
export function isVerifiedAdmin(user:AuthIdentity|null,adminEmail:string|undefined){return !!user?.email_confirmed_at&&!!adminEmail&&user.email?.toLowerCase()===adminEmail.trim().toLowerCase();}
export function canManageNote(note:{owner:string;status:string},user:{id:string;isAdmin:boolean}){return note.owner===user.id||(user.isAdmin&&note.status==='published');}
export const noteStates=['draft','hidden','published'] as const;
