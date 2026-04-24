const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('dna_matches', (item) =>
  `Analyze this DNA match: Match with ${item.match_name} sharing ${item.shared_cm} cM across ${item.shared_segments} segments on chromosomes ${item.chromosomes}. Predicted relationship: ${item.predicted_relationship}. Match confidence: ${item.confidence}%. Explain the significance of this match, what the shared DNA amount suggests about the relationship, how to narrow down the exact connection, recommended next steps for research, and what triangulation methods could help.`
);
