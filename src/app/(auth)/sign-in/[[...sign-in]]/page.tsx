'use client';
import { SignIn } from '@clerk/nextjs';
export default function Page(){ return (<div className='min-h-[60vh] grid place-items-center'><SignIn routing='hash' appearance={{ variables:{ colorPrimary:'#0b468c' } }} /></div>); }
