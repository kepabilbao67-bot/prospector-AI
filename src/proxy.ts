import {NextRequest,NextResponse} from "next/server";
import {SESSION_COOKIE,verifySession} from "@/lib/session";
export async function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(path==="/login"||path==="/access-required"||path==="/api/auth/login"||path==="/api/auth/logout")return NextResponse.next();
 const session=await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
 if(!session){
  if(path.startsWith("/api/"))return NextResponse.json({error:"Unauthorized"},{status:401});
  return NextResponse.redirect(new URL("/login",request.url));
 }
 // Keep all APIs denied except the explicitly audited CRM read API.
 // Do not forward userId as a trusted request header; route reads signed cookie again.
 if(path.startsWith("/api/")&&path!=="/api/contacts")return NextResponse.json({error:"Endpoint pending tenant isolation"},{status:503});
 return NextResponse.next();
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js).*)"]};
