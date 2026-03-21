/**
 * Parses portfolio holdings files in CSV format.
 * Expected CSV columns: fundCode, security, isin, quantity, marketValue, weight
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
      fundCode: record.fundcode || record.fund_code || '',
      securityName: record.security || record.security_name || '',
      isin: record.isin || record.isin_code || '',
      assetClass: record.assetclass || record.asset_class || '',
      quantity: parseFloat(record.quantity || record.units || 0),
      marketValue: parseFloat(record.marketvalue || record.market_value || 0),
      costValue: parseFloat(record.costvalue || record.cost_value || 0),
      weight: parseFloat(record.weight || record.allocation || 0),
      currency: record.currency || 'KES',
    });
  }

  return records;
}

function parse(buffer, format = 'csv') {
  if (format === 'csv') return parseCSV(buffer);
  throw new Error(`Unsupported holdings file format: ${format}`);
}

module.exports = { parse, parseCSV };
