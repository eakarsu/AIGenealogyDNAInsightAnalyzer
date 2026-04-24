const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { queryAI } = require('../openrouter');

const router = express.Router();

// AI Center - direct AI queries for all features
const aiFeatures = [
  { id: 'ethnicity-deep-dive', name: 'Ethnicity Deep Dive', description: 'Get detailed AI analysis of any ethnic background', icon: '🌍', systemPrompt: 'You are an expert geneticist specializing in population genetics and ethnicity analysis.' },
  { id: 'ancestor-search', name: 'AI Ancestor Search', description: 'Let AI help discover potential ancestors', icon: '🔍', systemPrompt: 'You are an expert genealogist who helps people discover and research their ancestors.' },
  { id: 'health-genetics', name: 'Genetic Health Advisor', description: 'AI-powered genetic health insights', icon: '🏥', systemPrompt: 'You are a genetic counselor providing educational information about genetic health predispositions. Always remind users this is not medical advice.' },
  { id: 'migration-tracer', name: 'Migration Route Tracer', description: 'AI traces ancestral migration routes', icon: '🗺️', systemPrompt: 'You are a historical demographer specializing in human migration patterns and population movements.' },
  { id: 'relationship-calculator', name: 'DNA Relationship Calculator', description: 'AI calculates family relationships from DNA', icon: '👨‍👩‍👧‍👦', systemPrompt: 'You are a DNA relationship expert who can calculate and explain genetic relationships based on shared DNA.' },
  { id: 'haplogroup-explorer', name: 'Haplogroup Explorer', description: 'Explore ancient lineages through haplogroups', icon: '🧬', systemPrompt: 'You are an expert in human haplogroups, ancient DNA, and deep genealogy.' },
  { id: 'trait-predictor', name: 'Genetic Trait Predictor', description: 'AI predicts traits from genetic data', icon: '👁️', systemPrompt: 'You are a geneticist who explains how genes influence physical and behavioral traits.' },
  { id: 'history-contextualizer', name: 'Historical Contextualizer', description: 'AI provides historical context for ancestors', icon: '📜', systemPrompt: 'You are a historian who provides rich context about what life was like during specific time periods and locations.' },
  { id: 'culture-explorer', name: 'Cultural Heritage Explorer', description: 'Discover cultural traditions of your ancestors', icon: '🎭', systemPrompt: 'You are a cultural anthropologist who explores traditions, customs, and cultural heritage of diverse populations.' },
  { id: 'surname-researcher', name: 'Surname Researcher', description: 'AI researches surname origins and meanings', icon: '📛', systemPrompt: 'You are an onomastics expert specializing in surname etymology, history, and geographic distribution.' },
  { id: 'dna-interpreter', name: 'DNA Match Interpreter', description: 'AI interprets DNA match results', icon: '🔬', systemPrompt: 'You are a genetic genealogy expert who interprets DNA match results and helps identify family connections.' },
  { id: 'document-analyzer', name: 'Document Analyzer', description: 'AI analyzes genealogical documents', icon: '📄', systemPrompt: 'You are an expert in historical document analysis, paleography, and genealogical record interpretation.' },
  { id: 'recipe-discoverer', name: 'Heritage Recipe Discoverer', description: 'Discover recipes from your ancestral homeland', icon: '🍲', systemPrompt: 'You are a culinary historian who connects food traditions to cultural and genetic heritage.' },
  { id: 'report-generator', name: 'Heritage Report Generator', description: 'Generate comprehensive heritage reports', icon: '📊', systemPrompt: 'You are a professional genealogist who creates comprehensive, well-structured heritage reports.' },
  { id: 'ancient-origins', name: 'Ancient Origins Explorer', description: 'Explore deep ancient ancestry connections', icon: '🏛️', systemPrompt: 'You are an archaeogeneticist who connects modern DNA to ancient populations and civilizations.' },
  { id: 'family-story', name: 'Family Story Generator', description: 'AI creates narratives from family data', icon: '📖', systemPrompt: 'You are a creative writer who crafts compelling family history narratives based on genealogical data.' },
  { id: 'dna-education', name: 'DNA Science Educator', description: 'Learn about DNA and genetics basics', icon: '🎓', systemPrompt: 'You are a genetics educator who explains DNA science, inheritance patterns, and genetic genealogy concepts in accessible terms.' },
  { id: 'photo-era-analyzer', name: 'Photo Era Analyzer', description: 'AI identifies time periods from photo descriptions', icon: '📸', systemPrompt: 'You are an expert in historical photography, fashion, and material culture who can identify time periods and locations from visual descriptions.' },
];

// Get all AI features
router.get('/features', authenticateToken, (req, res) => {
  res.json(aiFeatures);
});

// Query specific AI feature
router.post('/query', authenticateToken, async (req, res) => {
  try {
    const { featureId, prompt } = req.body;
    const feature = aiFeatures.find(f => f.id === featureId);
    if (!feature) {
      return res.status(400).json({ error: 'Invalid AI feature' });
    }
    const result = await queryAI(prompt, feature.systemPrompt);
    res.json({ feature: feature.name, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// General AI query
router.post('/general', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await queryAI(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
