import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, toFineractDate } from '../utils/formatters';

describe('formatDate', () => {
  it('converts [2026,3,21] to 21/03/2026', () => {
    expect(formatDate([2026, 3, 21])).toBe('21/03/2026');
  });

  it('handles single-digit day and month with zero padding', () => {
    expect(formatDate([2025, 1, 5])).toBe('05/01/2025');
  });

  it('returns "-" for null or undefined input', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns "-" for non-array input', () => {
    expect(formatDate('2026-03-21')).toBe('-');
  });
});

describe('formatCurrency', () => {
  it('formats amount with KES currency', () => {
    const result = formatCurrency(1500.5, 'KES');
    expect(result).toContain('1,500.50');
    expect(result).toContain('KES');
  });

  it('formats amount with USD currency (default)', () => {
    const result = formatCurrency(2500);
    expect(result).toContain('2,500.00');
    expect(result).toContain('$');
  });

  it('returns "-" for null or undefined amount', () => {
    expect(formatCurrency(null)).toBe('-');
    expect(formatCurrency(undefined)).toBe('-');
  });
});

describe('toFineractDate', () => {
  it('converts a Date to Fineract format "d Month yyyy"', () => {
    const date = new Date(2026, 2, 21); // March 21, 2026
    expect(toFineractDate(date)).toBe('21 March 2026');
  });

  it('converts a date string to Fineract format', () => {
    const result = toFineractDate('2025-06-15');
    expect(result).toContain('June');
    expect(result).toContain('2025');
  });
});
