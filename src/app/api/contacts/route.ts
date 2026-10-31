import {NextRequest,NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {SESSION_COOKIE,verifySession} from "@/lib/session";
function identity(request:NextRequest){return verifySession(request.cookies.get(SESSION_COOKIE)?.value)?.userId;}
export async function GET(request:NextRequest){
 const userId=identity(request);if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 try {
  const {searchParams}=new URL(request.url);
  const network=searchParams.get("network"), status=searchParams.get("status"), search=searchParams.get("search");
  const contacts=await prisma.contact.findMany({
   where:{userId,...(network&&network!=="all"?{network}:{}),...(status&&status!=="all"?{status}:{}),
    ...(search?{OR:[{firstName:{contains:search}},{lastName:{contains:search}},{company:{contains:search}}]}:{})},
   orderBy:{createdAt:"desc"},take:50
  });
  return NextResponse.json({contacts,total:contacts.length,page:1,totalPages:1});
 }catch{return NextResponse.json({error:"CRM no disponible"},{status:503});}
}
export async function POST(request:NextRequest){
 const userId=identity(request);if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:unknown;try{data=await request.json();}catch{return NextResponse.json({error:"JSON inválido"},{status:400});}
 if(!data||typeof data!=="object")return NextResponse.json({error:"Datos inválidos"},{status:400});
 const p=data as Record<string,unknown>;
 if(typeof p.firstName!=="string"||!p.firstName.trim()||p.firstName.length>120)return NextResponse.json({error:"Nombre obligatorio"},{status:400});
 const text=(key:string)=>typeof p[key]==="string"?(p[key] as string).slice(0,500):null;
 try{
  const contact=await prisma.contact.create({data:{
   userId,firstName:p.firstName.trim(),lastName:text("lastName"),email:text("email"),
   company:text("company"),jobTitle:text("jobTitle"),network:text("network")||"other",
   profileUrl:text("profileUrl"),tags:"[]",status:"new",score:0,
  }});
  return NextResponse.json(contact,{status:201});
 }catch{return NextResponse.json({error:"No se pudo guardar el contacto"},{status:503});}
}
