const https = require('https');
require('dotenv').config({ path: '../.env' });

async function queryAI(prompt, systemPrompt = 'You are an expert genealogist and DNA analyst. Provide detailed, professional analysis.') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      result: 'OpenRouter API key not configured. Please add your key to the .env file.',
      model: model
    };
  }

  const body = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Genealogy DNA Insight Analyzer'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0]) {
            resolve({
              success: true,
              result: parsed.choices[0].message.content,
              model: parsed.model || model,
              usage: parsed.usage || null
            });
          } else if (parsed.error) {
            resolve({ success: false, result: parsed.error.message || 'AI request failed', model });
          } else {
            resolve({ success: false, result: 'Unexpected AI response format', model });
          }
        } catch (e) {
          resolve({ success: false, result: 'Failed to parse AI response', model });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, result: `AI request error: ${e.message}`, model });
    });

    req.write(body);
    req.end();
  });
}

module.exports = { queryAI };
