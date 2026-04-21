import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  (await cookies()).delete('student_session');
  // Redirect to the home page (dashboard)
  return NextResponse.redirect(new URL('/', request.url), 303);
}
