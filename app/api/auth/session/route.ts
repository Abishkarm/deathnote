import {getUser,json,authConfig} from '../../../supabase-auth';
export async function GET(){return json({user:await getUser(),configured:!!authConfig()});}
