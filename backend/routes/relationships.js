const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('family_relationships', (item) =>
  `Analyze this family DNA relationship: ${item.person_name} is a ${item.relationship_type} with ${item.shared_cm} cM of shared DNA across ${item.shared_segments} segments. Confidence: ${item.confidence}%. Explain what this amount of shared DNA means, possible relationship ranges, how DNA inheritance works at this level, and tips for confirming this relationship through additional research or testing.`
);
