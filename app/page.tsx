import { getChatGPTUser } from './chatgpt-auth';
import Notebook from './notebook';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <Notebook user={user?{name:user.displayName}:null}/>;}
