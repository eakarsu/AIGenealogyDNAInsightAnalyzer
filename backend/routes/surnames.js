const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('surname_origins', (item) =>
  `Research the surname "${item.surname}" in depth. Origin: ${item.origin_language} from ${item.origin_country}. Meaning: ${item.meaning}. First recorded: ${item.first_recorded}. Category: ${item.category}. Provide detailed etymology, historical context of the surname's emergence, notable bearers throughout history, geographic distribution, coat of arms or heraldic associations, and how the surname may have evolved in different regions.`
);
