import Link from "next/link";

const steps = [
  { title: "1. Registrar un cliente", text: "Abre Contactos y añade una empresa real con los datos que hayas verificado. No cargues datos de demostración en una base con clientes reales.", href: "/contacts", action: "Abrir CRM" },
  { title: "2. Preparar el mensaje", text: "Usa Templates para redactar una propuesta personalizada. Revísala antes de compartirla. No se envía automáticamente desde esta guía.", href: "/templates", action: "Preparar texto" },
  { title: "3. Organizar la oportunidad", text: "Clasifica los contactos y revisa el Pipeline. Mantén las campañas en borrador hasta comprobar destinatarios y consentimiento.", href: "/pipeline", action: "Ver oportunidades" },
];

export default function EmpezarPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-gray-900 p-6 text-white">
        <p className="text-sm text-gray-300">PROSPECTOR IA 360 · GUÍA OPERATIVA</p>
        <h1 className="mt-2 text-3xl font-semibold">Empezar aquí</h1>
        <p className="mt-3 text-sm leading-6 text-gray-200">Recorrido de trabajo para captar empresas sin envíos automáticos ni contactos ficticios. Utiliza únicamente datos reales y autorizados.</p>
      </div>
      <div className="grid gap-4">
        {steps.map((step) => (
          <article key={step.title} className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">{step.title}</h2>
            <p className="my-3 text-sm leading-6 text-gray-600">{step.text}</p>
            <Link href={step.href} className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">{step.action}</Link>
          </article>
        ))}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold">Integraciones: estado real</h2>
        <p className="mt-2">Google Maps y LinkedIn: búsqueda externa, no importación automática verificada. WhatsApp Business: abrir un borrador no equivale a conectar su API. Gemini Live, KEPA VOZ 360 e IA360: conexión pendiente de verificar. Esta página no inicia campañas ni envía mensajes.</p>
      </div>
      <p className="text-xs text-gray-500">Antes de trabajar con datos personales, confirma que tu sesión y la base de datos están correctamente aisladas. La disponibilidad de cada módulo depende del entorno desplegado.</p>
    </section>
  );
}
