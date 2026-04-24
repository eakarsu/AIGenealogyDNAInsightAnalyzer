const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('heritage_reports', (item) =>
  `Generate a comprehensive heritage report based on this data: Report type: ${item.report_type}. Subject: ${item.subject_name}. Summary: ${item.summary}. Key findings: ${item.key_findings}. Regions covered: ${item.regions}. Time span: ${item.time_span}. Provide a thorough, professional genealogical analysis that synthesizes all findings, identifies patterns, suggests areas for further research, and creates a narrative connecting the various elements of this person's heritage.`
);
