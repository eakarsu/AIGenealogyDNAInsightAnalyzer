const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('ethnicity_analyses', (item) =>
  `Analyze this DNA ethnicity result in detail. The person has ${item.percentage}% ${item.region} ancestry from ${item.sub_region}. Their confidence level is ${item.confidence}. Provide historical context about this ethnic group, migration history, and what this means for the person's heritage. Include interesting cultural facts and genetic implications.`
);
