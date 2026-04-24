const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('heritage_recipes', (item) =>
  `Explore this heritage recipe connected to ancestral origins: Recipe: ${item.recipe_name} from ${item.origin_region} (${item.origin_country}). Cuisine type: ${item.cuisine_type}. Era: ${item.era}. Ingredients: ${item.key_ingredients}. Description: ${item.description}. Provide the historical and cultural significance of this dish, how it connects to the family's heritage, traditional preparation methods, how the recipe has evolved, regional variations, and the cultural ceremonies or occasions associated with it.`
);
