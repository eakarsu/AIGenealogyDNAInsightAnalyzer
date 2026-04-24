const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('haplogroups', (item) =>
  `Provide deep analysis of haplogroup ${item.haplogroup}: Type: ${item.type} (${item.type === 'maternal' ? 'mtDNA' : 'Y-DNA'}). Origin region: ${item.origin_region}, age: ${item.age}. Description: ${item.description}. Explain the ancient origins of this haplogroup, its migration paths through history, notable historical figures who shared this haplogroup, what percentage of modern populations carry it, and what it reveals about deep ancestry.`
);
