import { notFound } from "next/navigation";

/**
 * Documentos 360 is intentionally inaccessible until server-side session
 * verification and tenant isolation are implemented and tested.
 * Do not replace this with a client-side check or a shared static password.
 */
export default function Documentos360ProtectedLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  notFound();
}
