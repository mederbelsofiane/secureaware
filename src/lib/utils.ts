import { type ClassValue, clsx } from "clsx";

// Simple cn function without tailwind-merge for now
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRiskColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function getRiskBgColor(score: number): string {
  if (score >= 80) return "bg-green-500/20 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
  if (score >= 40) return "bg-orange-500/20 border-orange-500/30";
  return "bg-red-500/20 border-red-500/30";
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return "Low Risk";
  if (score >= 60) return "Medium Risk";
  if (score >= 40) return "High Risk";
  return "Critical Risk";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "BEGINNER": return "text-green-400 bg-green-500/20";
    case "INTERMEDIATE": return "text-yellow-400 bg-yellow-500/20";
    case "ADVANCED": return "text-red-400 bg-red-500/20";
    default: return "text-gray-400 bg-gray-500/20";
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    PHISHING: "text-red-400 bg-red-500/20",
    PASSWORDS: "text-blue-400 bg-blue-500/20",
    SOCIAL_ENGINEERING: "text-purple-400 bg-purple-500/20",
    MALWARE: "text-orange-400 bg-orange-500/20",
    BROWSING: "text-cyan-400 bg-cyan-500/20",
    MOBILE: "text-green-400 bg-green-500/20",
    NETWORK: "text-yellow-400 bg-yellow-500/20",
    DATA_PROTECTION: "text-indigo-400 bg-indigo-500/20",
    COMPLIANCE: "text-pink-400 bg-pink-500/20",
    GENERAL: "text-gray-400 bg-gray-500/20",
  };
  return colors[category] || colors.GENERAL;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "text-green-400 bg-green-500/20",
    DRAFT: "text-gray-400 bg-gray-500/20",
    PUBLISHED: "text-blue-400 bg-blue-500/20",
    PAUSED: "text-yellow-400 bg-yellow-500/20",
    COMPLETED: "text-green-400 bg-green-500/20",
    CANCELLED: "text-red-400 bg-red-500/20",
    ARCHIVED: "text-gray-400 bg-gray-500/20",
    INACTIVE: "text-gray-400 bg-gray-500/20",
    SUSPENDED: "text-red-400 bg-red-500/20",
    NEW: "text-blue-400 bg-blue-500/20",
    IN_REVIEW: "text-yellow-400 bg-yellow-500/20",
    CONTACTED: "text-purple-400 bg-purple-500/20",
    CLOSED: "text-gray-400 bg-gray-500/20",
  };
  return colors[status] || "text-gray-400 bg-gray-500/20";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
