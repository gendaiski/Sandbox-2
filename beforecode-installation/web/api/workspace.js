import { work, InputError } from '../lib/workspace.mjs';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST') {res.setHeader('Allow','POST');return res.status(405).json({error:'Use POST.'});}
  try {
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    return res.status(200).json(await work(body));
  } catch(error) {
    const client=error instanceof InputError || error instanceof SyntaxError;
    return res.status(client?400:500).json({error:client?error.message:'Could not generate the workspace. Please try again.'});
  }
}
