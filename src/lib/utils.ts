import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getNetworkColor(network: string): string {
  const colors: Record<string, string> = {
    linkedin: "bg-blue-600",
    fiverr: "bg-green-500",
    twitter: "bg-sky-500",
    instagram: "bg-pink-500",
    email: "bg-yellow-500",
    other: "bg-gray-500",
  };
  return colors[network] || colors.other;
}

export function getNetworkIcon(network: string): string {
  const icons: Record<string, string> = {
    linkedin: "💼",
    fiverr: "🟢",
    twitter: "🐦",
    instagram: "📸",
    email: "📧",
    whatsapp: "💬",
    tiktok: "🎵",
    facebook: "📘",
    telegram: "✈️",
    other: "🌐",
  };
  return icons[network] || icons.other;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-gray-100 text-gray-800",
    contacted: "bg-blue-100 text-blue-800",
    replied: "bg-green-100 text-green-800",
    qualified: "bg-purple-100 text-purple-800",
    converted: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
  };
  return colors[status] || colors.new;
}

export function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

export function humanizeDelay(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function parseTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

export function generateId(): string {
  return crypto.randomUUID();
}
