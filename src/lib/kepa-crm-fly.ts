import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { parseKepaContacts, type KepaContact } from "./kepa-crm";

const execFileAsync = promisify(execFile);
const PREFIX = "KEPA_CONTACTS_JSON=";
const REMOTE_SCRIPT = [
  'const {createClient}=require("@libsql/client");',
  '(async()=>{',
  'const c=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});',
  'try{',
  'const r=await c.execute({sql:"SELECT doc FROM panel_contacts WHERE tenant_id = ? ORDER BY updated_at DESC LIMIT 10001",args:["kepa"]});',
  'const docs=r.rows.map(row=>JSON.parse(row.doc));',
  'if(docs.length>10000||docs.some(d=>d.tenantId!=="kepa")) throw new Error("invalid tenant/count");',
  'console.log("KEPA_CONTACTS_JSON="+JSON.stringify({success:true,data:docs}));',
  '}finally{c.close()}',
  '})().catch(()=>{console.error("READ_FAILED");process.exit(1)})',
].join("\n");

export function localFlyBridgeEnabled(): boolean {
  return process.env.NODE_ENV !== "production" &&
    process.env.KEPA_CRM_BRIDGE_MODE === "fly-ssh-local" &&
    process.platform === "win32";
}

export async function readKepaViaFly(): Promise<{ok: true; contacts: KepaContact[]; count: number}> {
  if (!localFlyBridgeEnabled()) throw new Error("Local Fly bridge disabled");
  const profile = process.env.USERPROFILE;
  if (!profile) throw new Error("Missing user profile");
  const executable = join(profile, ".fly", "bin", "flyctl.exe");
  // The executable receives a constant query; request parameters never reach the shell.
  const payload = Buffer.from(REMOTE_SCRIPT, "utf8").toString("base64");
  const command = "node -e eval(Buffer.from(process.argv[1],String.fromCharCode(98,97,115,101,54,52)).toString()) " + payload;
  const { stdout } = await execFileAsync(executable, [
    "ssh", "console", "-a", "llamadas360-kepatecnologia", "-C", command,
  ], { timeout: 30000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  const line = stdout.split(/\r?\n/).find(l => l.startsWith(PREFIX));
  if (!line) throw new Error("CRM result missing");
  const response: unknown = JSON.parse(line.slice(PREFIX.length));
  const contacts = parseKepaContacts(response, "kepa");
  return {ok:true, contacts, count:contacts.length};
}
