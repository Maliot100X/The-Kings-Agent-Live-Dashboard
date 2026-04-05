import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  return format(d, 'HH:mm:ss');
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return format(d, 'MMM d');
}

export function generateAgentId(): string {
  return `agent-${Math.random().toString(36).substring(2, 9)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    online: 'bg-neon-green',
    offline: 'bg-red-500',
    busy: 'bg-neon-yellow',
    idle: 'bg-gray-500',
    error: 'bg-neon-pink',
  };
  return colors[status] || 'bg-gray-500';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export const AGENT_TYPES = [
  { id: 'orchestrator', name: 'Orchestrator', icon: 'Crown', color: '#ff006e' },
  { id: 'coder', name: 'Code Agent', icon: 'Code', color: '#00f3ff' },
  { id: 'analyst', name: 'Analyst', icon: 'BarChart', color: '#39ff14' },
  { id: 'researcher', name: 'Researcher', icon: 'Search', color: '#bc13fe' },
  { id: 'creative', name: 'Creative', icon: 'Palette', color: '#ffea00' },
] as const;
