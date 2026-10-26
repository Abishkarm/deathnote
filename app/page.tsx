import Notebook from './notebook';
import {authConfig} from './supabase-auth';
export const dynamic='force-dynamic';
export default function Home(){return <Notebook configured={!!authConfig()}/>;}
