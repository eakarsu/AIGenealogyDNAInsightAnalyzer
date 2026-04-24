const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('ancient_ancestry', (item) =>
  `Explore this ancient ancestry connection: Ancient population: ${item.population_name} from ${item.region}, time period: ${item.time_period}. DNA affinity: ${item.affinity_percentage}%. Description: ${item.description}. Archaeological sites: ${item.archaeological_sites}. Provide fascinating details about this ancient population, their culture and way of life, what archaeological evidence tells us, how modern DNA connects to these ancient peoples, and what this means for understanding deep human history.`
);
