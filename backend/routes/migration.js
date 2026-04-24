const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('migration_patterns', (item) =>
  `Analyze this ancestral migration pattern: Migration from ${item.origin} to ${item.destination} during the ${item.era} era (approximately ${item.year_range}). Reason: ${item.reason}. Route: ${item.route}. Provide detailed historical context about why people migrated along this route, what conditions they faced, how this migration shaped communities, and what genetic markers are associated with this migration pattern.`
);
