const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('cultural_heritage', (item) =>
  `Explore the cultural heritage of ${item.culture_name} from the ${item.region} region. Tradition: ${item.tradition}. Time period: ${item.time_period}. Category: ${item.category}. Description: ${item.description}. Provide a rich exploration of this cultural tradition, its historical significance, how it has evolved over time, its connection to genetic heritage, and how descendants can connect with and preserve this cultural legacy today.`
);
