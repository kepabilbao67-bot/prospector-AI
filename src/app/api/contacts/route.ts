import {NextRequest,NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {readAirtableContacts,createAirtableContact} from "@/lib/airtable-crm";
import {SESSION_COOKIE,verifySession} from "@/lib/session";
async function identity(request:NextRequest){return (await verifySession(request.cookies.get(SESSION_COOKIE)?.value))?.userId;}
export async function GET(request:NextRequest){
 const userId=await identity(request);if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 try {
  const {searchParams}=new URL(request.url);
  const network=searchParams.get("network"), status=searchParams.get("status"), search=searchParams.get("search");
  const requestedPage=Number(searchParams.get("page")||"1");
  const page=Number.isSafeInteger(requestedPage)&&requestedPage>0?Math.min(requestedPage,100000):1;
  const airtable=await readAirtableContacts(userId,{network,status,search,page});
  if(airtable)return NextResponse.json(airtable,{headers:{"Cache-Control":"private, no-store"}});
  const contacts=await prisma.contact.findMany({
   where:{userId,...(network&&network!=="all"?{network}:{}),...(status&&status!=="all"?{status}:{}),
    ...(search?{OR:[{firstName:{contains:search}},{lastName:{contains:search}},{company:{contains:search}}]}:{})},
   orderBy:{createdAt:"desc"},skip:(page-1)*50,take:50
  });
  const total=await prisma.contact.count({where:{userId,...(network&&network!=="all"?{network}:{}),...(status&&status!=="all"?{status}:{}),...(search?{OR:[{firstName:{contains:search}},{lastName:{contains:search}},{company:{contains:search}}]}:{})}});
  return NextResponse.json({contacts,total,page,totalPages:Math.max(1,Math.ceil(total/50))},{headers:{"Cache-Control":"private, no-store"}});
 }catch{return NextResponse.json({error:"CRM no disponible"},{status:503});}
}
export async function POST(request:NextRequest){
 const userId=await identity(request);if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:unknown;try{data=await request.json();}catch{return NextResponse.json({error:"JSON inválido"},{status:400});}
 if(!data||typeof data!=="object")return NextResponse.json({error:"Datos inválidos"},{status:400});
 const p=data as Record<string,unknown>;
 if(typeof p.firstName!=="string"||!p.firstName.trim()||p.firstName.length>120)return NextResponse.json({error:"Nombre obligatorio"},{status:400});
 const text=(key:string)=>typeof p[key]==="string"?(p[key] as string).slice(0,500):null;
 try{
  const airtable=await createAirtableContact(userId,{
   firstName:p.firstName.trim(),lastName:text("lastName"),email:text("email"),
   company:text("company"),jobTitle:text("jobTitle"),network:text("network"),
  });
  if(airtable)return airtable.duplicate
   ? NextResponse.json({error:"El contacto ya existe",contact:airtable.contact},{status:409})
   : NextResponse.json(airtable.contact,{status:201});
  const contact=await prisma.contact.create({data:{
   userId,firstName:p.firstName.trim(),lastName:text("lastName"),email:text("email"),
   company:text("company"),jobTitle:text("jobTitle"),network:text("network")||"other",
   profileUrl:text("profileUrl"),tags:"[]",status:"new",score:0,
  }});
  return NextResponse.json(contact,{status:201});
 }catch{return NextResponse.json({error:"No se pudo guardar el contacto"},{status:503});}
}
