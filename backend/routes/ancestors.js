const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('ancestors', (item) =>
  `Research and provide detailed analysis about this ancestor: ${item.name}, born ${item.birth_year} in ${item.birth_place}, died ${item.death_year} in ${item.death_place}. Occupation: ${item.occupation}. Relationship: ${item.relationship}. Provide historical context of their era, likely living conditions, significant world events during their lifetime, and what records might exist to learn more about them.`
);
