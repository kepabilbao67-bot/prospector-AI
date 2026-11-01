import { notFound } from "next/navigation";

// Fail closed: no document UI until user authentication and tenant isolation are verified.
export default function Documentos360Page() {
  notFound();
}
