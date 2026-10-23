import Link from "next/link";

const steps = [
  { title: "0. Buscar cinco empresas reales", text: "Empieza cada día buscando por sector y zona. Comprueba en las fuentes oficiales el nombre, la actividad y los datos de contacto antes de escribir.", href: "/buscar-empresas", action: "Buscar empresas" },
  { title: "1. CRM — pendiente de desbloqueo seguro", text: "El registro de contactos está temporalmente bloqueado en esta rama hasta verificar autenticación y aislamiento. No introduzcas datos de clientes todavía.", href: "/contacts", action: "Ver CRM" },
  { title: "2. Preparar el mensaje y WhatsApp", text: "Desde Buscar empresas redacta un mensaje, guárdalo en esta pestaña y ábrelo en WhatsApp solo después de verificar el número. La acción nunca envía sola.", href: "/buscar-empresas", action: "Abrir preparador" },
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
        <p className="mt-2">Google Maps y LinkedIn: búsquedas externas, no importación automática verificada. WhatsApp: se prepara un chat mediante enlace, no hay cuenta Business API conectada. Gemini Live, KEPA VOZ 360 e IA360: conexión pendiente de verificar. Esta página no inicia campañas ni envía mensajes.</p>
      </div>
      <p className="text-xs text-gray-500">Antes de trabajar con datos personales, confirma que tu sesión y la base de datos están correctamente aisladas. La disponibilidad de cada módulo depende del entorno desplegado.</p>
    </section>
  );
}
