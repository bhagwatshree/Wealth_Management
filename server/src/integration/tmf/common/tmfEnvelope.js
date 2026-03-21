/**
 * TMF Open API standard envelope, pagination, HATEOAS, and field filtering.
 *
 * All TMF resources follow a common shape:
 *   { id, href, name, @type, @baseType, @schemaLocation, ...domain fields }
 *
 * Collections are returned with:
 *   X-Total-Count header, X-Result-Count header
 *   Link header for pagination (first, prev, next, last)
 */

const BASE_PATH = '/api/tmf';

// ---------------------------------------------------------------------------
// Resource envelope
// ---------------------------------------------------------------------------

function toTmfResource(entity, { type, baseType, basePath, schemaLocation }) {
  return {
    id: entity.id || entity.productId || entity.profileId || entity.campaignId || entity.kycId || entity.screeningId,
    href: `${BASE_PATH}${basePath}/${entity.id || entity.productId || entity.profileId || entity.campaignId || entity.kycId || entity.screeningId}`,
    '@type': type,
    '@baseType': baseType || type,
    '@schemaLocation': schemaLocation || `${BASE_PATH}/schema/${type}.json`,
    ...entity,
  };
}

// ---------------------------------------------------------------------------
// Collection with pagination
// ---------------------------------------------------------------------------

function toTmfCollection(entities, { type, baseType, basePath, schemaLocation, req }) {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const total = entities.length;

  // Apply pagination
  const page = entities.slice(offset, offset + limit);

  // Apply field filtering (?fields=id,name,status)
  const filtered = req.query.fields ? filterFields(page, req.query.fields) : page;

  // Wrap each entity
  const items = filtered.map((e) =>
    toTmfResource(e, { type, baseType, basePath, schemaLocation })
  );

  // Build Link header
  const links = buildLinkHeader(req, offset, limit, total, basePath);

  return { items, total, offset, limit, links };
}

function sendTmfCollection(res, collectionResult) {
  const { items, total, offset, limit, links } = collectionResult;

  res.set('X-Total-Count', String(total));
  res.set('X-Result-Count', String(items.length));

  if (links.length > 0) {
    res.set('Link', links.join(', '));
  }

  res.json(items);
}

// ---------------------------------------------------------------------------
// Field filtering — TMF ?fields= support
// ---------------------------------------------------------------------------

function filterFields(entities, fieldsParam) {
  const fields = fieldsParam.split(',').map((f) => f.trim());
  // Always include id, href, @type
  const required = ['id', 'href', '@type', '@baseType', '@schemaLocation'];
  const allowed = new Set([...required, ...fields]);

  return entities.map((entity) => {
    const filtered = {};
    for (const key of Object.keys(entity)) {
      if (allowed.has(key)) filtered[key] = entity[key];
    }
    return filtered;
  });
}

// ---------------------------------------------------------------------------
// HATEOAS Link header
// ---------------------------------------------------------------------------

function buildLinkHeader(req, offset, limit, total, basePath) {
  const base = `${req.protocol}://${req.get('host')}${BASE_PATH}${basePath}`;
  const links = [];

  // first
  links.push(`<${base}?offset=0&limit=${limit}>; rel="first"`);

  // prev
  if (offset > 0) {
    const prevOffset = Math.max(0, offset - limit);
    links.push(`<${base}?offset=${prevOffset}&limit=${limit}>; rel="prev"`);
  }

  // next
  if (offset + limit < total) {
    links.push(`<${base}?offset=${offset + limit}&limit=${limit}>; rel="next"`);
  }

  // last
  const lastOffset = Math.max(0, Math.floor((total - 1) / limit) * limit);
  links.push(`<${base}?offset=${lastOffset}&limit=${limit}>; rel="last"`);

  return links;
}

module.exports = { toTmfResource, toTmfCollection, sendTmfCollection, BASE_PATH };
