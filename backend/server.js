const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ethnicity', require('./routes/ethnicity'));
app.use('/api/ancestors', require('./routes/ancestors'));
app.use('/api/health-risks', require('./routes/healthRisks'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/relationships', require('./routes/relationships'));
app.use('/api/haplogroups', require('./routes/haplogroups'));
app.use('/api/traits', require('./routes/traits'));
app.use('/api/timelines', require('./routes/timelines'));
app.use('/api/culture', require('./routes/culture'));
app.use('/api/surnames', require('./routes/surnames'));
app.use('/api/dna-matches', require('./routes/dnaMatches'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ancient', require('./routes/ancient'));
app.use('/api/ai-center', require('./routes/aiCenter'));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
