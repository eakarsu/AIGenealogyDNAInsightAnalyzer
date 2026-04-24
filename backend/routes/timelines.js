const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('ancestor_timelines', (item) =>
  `Create a detailed historical context for this ancestor timeline event: ${item.ancestor_name} - Event: ${item.event_type} in ${item.year} at ${item.location}. Details: ${item.description}. Provide rich historical context about what was happening in that location during that year, what daily life was like, major historical events of the era, and how this event fits into broader family history patterns.`
);
