const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('genealogy_documents', (item) =>
  `Analyze this genealogical document: Type: ${item.document_type}. Title: ${item.title}. Date: ${item.document_date}. Location: ${item.location}. Person: ${item.person_name}. Content summary: ${item.content_summary}. Provide expert analysis of what information can be extracted from this type of document, its reliability as a historical source, what other records might corroborate it, common pitfalls in interpreting such documents, and what additional research it suggests.`
);
