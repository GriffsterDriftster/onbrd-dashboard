import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  if (id) res.cookies.set('clientId', id, { path: '/', httpOnly: false, sameSite: 'lax' });
  return res;
}
