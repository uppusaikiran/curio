import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { QlooEntity, QlooInsight, QlooTrendingEntity } from '@/types/qloo'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get image URL for an entity or generate a consistent placeholder
 * 
 * @param entity QlooEntity, QlooInsight, or QlooTrendingEntity object
 * @returns Image URL string
 */
export function getEntityImage(entity: QlooEntity | QlooInsight | QlooTrendingEntity): string {
  // First, try to get the image URL from the entity properties
  if (entity.properties?.image?.url) {
    return entity.properties.image.url;
  }
  
  // Check for alternative image URL format
  if ((entity.properties as any)?.image_url) {
    return (entity.properties as any).image_url;
  }
  
  // For backward compatibility and fallback, generate a consistent placeholder
  // Use a stable seed based on entity ID or name to ensure consistent rendering
  const type = entity.type?.split(':').pop() || 'entity';
  const name = entity.name || 'Unknown';
  const seed = entity.entity_id || `${type}-${name}`;
  
  // Use a stable seed that will be the same on both server and client
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/450`;
}

/**
 * Format a number as a percentage
 * 
 * @param value Number between 0 and 1
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
} 