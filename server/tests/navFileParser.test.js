import { describe, it, expect } from 'vitest';

const { parse, parseCSV } = await import('../src/offers/parsers/navFileParser.js');

describe('navFileParser', () => {
  const sampleCSV = [
    'fundCode,fundName,navDate,navValue,units,aum',
    'MMF001,Money Market Fund,2026-03-20,15.75,1000000,15750000',
    'TBD002,Treasury Bond Fund,2026-03-20,102.50,500000,51250000',
  ].join('\n');

  describe('parseCSV', () => {
    it('parses valid CSV with headers', () => {
      const buffer = Buffer.from(sampleCSV);
      const records = parseCSV(buffer);

      expect(records).toHaveLength(2);

      expect(records[0].fundCode).toBe('MMF001');
      expect(records[0].fundName).toBe('Money Market Fund');
      expect(records[0].navDate).toBe('2026-03-20');
      expect(records[0].navValue).toBe(15.75);
      expect(records[0].units).toBe(1000000);
      expect(records[0].aum).toBe(15750000);
      expect(records[0].currency).toBe('KES');

      expect(records[1].fundCode).toBe('TBD002');
      expect(records[1].fundName).toBe('Treasury Bond Fund');
      expect(records[1].navValue).toBe(102.50);
      expect(records[1].units).toBe(500000);
      expect(records[1].aum).toBe(51250000);
    });

    it('handles different column name variants (fund_code, scheme_code)', () => {
      const altCSV = [
        'fund_code,fund_name,nav_date,nav_value,total_units,assets_under_management',
        'ALT001,Alternative Fund,2026-03-19,25.00,200000,5000000',
      ].join('\n');

      const buffer = Buffer.from(altCSV);
      const records = parseCSV(buffer);

      expect(records).toHaveLength(1);
      expect(records[0].fundCode).toBe('ALT001');
      expect(records[0].fundName).toBe('Alternative Fund');
      expect(records[0].navDate).toBe('2026-03-19');
      expect(records[0].navValue).toBe(25.00);
      expect(records[0].units).toBe(200000);
      expect(records[0].aum).toBe(5000000);
    });

    it('handles scheme_code column variant', () => {
      const schemeCSV = [
        'scheme_code,scheme_name,date,nav,units,aum',
        'SCH001,Scheme Fund,2026-03-18,50.00,100000,5000000',
      ].join('\n');

      const buffer = Buffer.from(schemeCSV);
      const records = parseCSV(buffer);

      expect(records).toHaveLength(1);
      expect(records[0].fundCode).toBe('SCH001');
      expect(records[0].fundName).toBe('Scheme Fund');
      expect(records[0].navDate).toBe('2026-03-18');
      expect(records[0].navValue).toBe(50.00);
    });

    it('returns empty array for single-line (header only)', () => {
      const headerOnly = 'fundCode,fundName,navDate,navValue,units,aum';
      const buffer = Buffer.from(headerOnly);
      const records = parseCSV(buffer);

      expect(records).toEqual([]);
    });

    it('returns empty array for empty content', () => {
      const buffer = Buffer.from('');
      const records = parseCSV(buffer);

      expect(records).toEqual([]);
    });

    it('skips rows with fewer columns than headers', () => {
      const badCSV = [
        'fundCode,fundName,navDate,navValue,units,aum',
        'MMF001,Money Market Fund,2026-03-20,15.75,1000000,15750000',
        'BAD001,Incomplete',
      ].join('\n');

      const buffer = Buffer.from(badCSV);
      const records = parseCSV(buffer);

      expect(records).toHaveLength(1);
      expect(records[0].fundCode).toBe('MMF001');
    });
  });

  describe('parse', () => {
    it('with csv format delegates to parseCSV', () => {
      const buffer = Buffer.from(sampleCSV);
      const records = parse(buffer, 'csv');

      expect(records).toHaveLength(2);
      expect(records[0].fundCode).toBe('MMF001');
      expect(records[1].fundCode).toBe('TBD002');
    });

    it('defaults to csv format when no format specified', () => {
      const buffer = Buffer.from(sampleCSV);
      const records = parse(buffer);

      expect(records).toHaveLength(2);
    });

    it('throws for unsupported format', () => {
      const buffer = Buffer.from('some data');
      expect(() => parse(buffer, 'xml')).toThrow('Unsupported NAV file format: xml');
    });
  });
});
