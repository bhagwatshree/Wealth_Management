/**
 * Parses NAV (Net Asset Value) files in CSV format.
 * Expected CSV columns: fundCode, navDate, navValue, units, aum
 * Also supports fixed-width format with configurable column widths.
 */

function parseCSV(buffer) {
  const content = buffer.toString('utf8').trim();
  const lines = content.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length < headers.length) continue;

    const record = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx];
    });

    records.push({
      fundCode: record.fundcode || record.fund_code || record.scheme_code || '',
      fundName: record.fundname || record.fund_name || record.scheme_name || '',
      navDate: record.navdate || record.nav_date || record.date || '',
      navValue: parseFloat(record.navvalue || record.nav_value || record.nav || 0),
      units: parseFloat(record.units || record.total_units || 0),
      aum: parseFloat(record.aum || record.assets_under_management || 0),
      currency: record.currency || 'KES',
    });
  }

  return records;
}

function parseFixedWidth(buffer, columnWidths) {
  const defaults = { fundCode: 10, fundName: 40, navDate: 12, navValue: 15, units: 15, aum: 20 };
  const widths = columnWidths || defaults;
  const content = buffer.toString('utf8').trim();
  const lines = content.split('\n');
  const records = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) continue;

    let pos = 0;
    const extract = (width) => {
      const val = line.substring(pos, pos + width).trim();
      pos += width;
      return val;
    };

    records.push({
      fundCode: extract(widths.fundCode),
      fundName: extract(widths.fundName),
      navDate: extract(widths.navDate),
      navValue: parseFloat(extract(widths.navValue)) || 0,
      units: parseFloat(extract(widths.units)) || 0,
      aum: parseFloat(extract(widths.aum)) || 0,
      currency: 'KES',
    });
  }

  return records;
}

function parse(buffer, format = 'csv', options = {}) {
  if (format === 'csv') return parseCSV(buffer);
  if (format === 'fixed-width') return parseFixedWidth(buffer, options.columnWidths);
  throw new Error(`Unsupported NAV file format: ${format}`);
}

module.exports = { parse, parseCSV, parseFixedWidth };
