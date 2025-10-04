/**
 * Date utility functions for formatting and manipulation
 */

/**
 * Format date to a readable string
 * @param date - The date to format (string, Date, or timestamp)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format date to a short string (MMM DD, YYYY)
 * @param date - The date to format
 * @returns Short formatted date string
 */
export function formatDateShort(date: string | Date | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date to a long string (Month DD, YYYY)
 * @param date - The date to format
 * @returns Long formatted date string
 */
export function formatDateLong(date: string | Date | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date and time
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date | number): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
}

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: string | Date | number): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Check if a date is yesterday
 * @param date - The date to check
 * @returns True if the date is yesterday
 */
export function isYesterday(date: string | Date | number): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dateObj.toDateString() === yesterday.toDateString();
  } catch (error) {
    console.error('Error checking if date is yesterday:', error);
    return false;
  }
}

/**
 * Get the start of the day for a given date
 * @param date - The date
 * @returns Start of day date
 */
export function getStartOfDay(date: string | Date | number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get the end of the day for a given date
 * @param date - The date
 * @returns End of day date
 */
export function getEndOfDay(date: string | Date | number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}
