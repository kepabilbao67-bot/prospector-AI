import { NextRequest,NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import {createSession,SESSION_COOKIE,SESSION_MAX_AGE} from "@/lib/session";
export async function POST(request:NextRequest){
 if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)return NextResponse.json({error:"Autenticación no configurada"},{status:503});
 let input:unknown;
 try{input=await request.json();}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400});}
 if(!input||typeof input!=="object")return NextResponse.json({error:"Solicitud inválida"},{status:400});
 const {email,password}=input as {email?:unknown;password?:unknown};
 if(typeof email!=="string"||typeof password!=="string"||email.length>320||password.length>1024||!email.includes("@"))return NextResponse.json({error:"Credenciales inválidas"},{status:401});
 try{
 const user=await prisma.user.findUnique({where:{email:email.trim().toLowerCase()},select:{id:true,password:true}});
 const valid=user&&user.password.startsWith("$2")&&await compare(password,user.password);
 if(!valid)return NextResponse.json({error:"Credenciales inválidas"},{status:401});
 const token=createSession(user.id);
 const response=NextResponse.json({ok:true});
 response.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_MAX_AGE});
 return response;
 }catch{return NextResponse.json({error:"Inicio de sesión no disponible"},{status:503});}
}
