const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('genetic_traits', (item) =>
  `Analyze this genetic trait prediction: Trait: ${item.trait_name}, predicted outcome: ${item.predicted_outcome}. Gene: ${item.gene}, variant: ${item.variant}. Probability: ${item.probability}%. Category: ${item.category}. Explain the genetics behind this trait, how this specific variant influences the outcome, the role of environmental factors, and interesting facts about the population distribution of this trait.`
);
