const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('health_risks', (item) =>
  `Provide a detailed genetic health analysis for this predisposition: Gene ${item.gene} with variant ${item.variant} is associated with ${item.condition}. Risk level: ${item.risk_level}, risk percentage: ${item.risk_percentage}%. Category: ${item.category}. Explain what this gene does, how the variant affects health, what preventive measures can be taken, and what lifestyle changes are recommended. Note: This is for educational purposes only and not medical advice.`
);
