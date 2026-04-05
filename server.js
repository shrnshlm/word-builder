import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic();

app.post('/api/check-grammar', async (req, res) => {
  const { sentence, lang } = req.body;

  if (!sentence || !lang) {
    return res.status(400).json({ error: 'Missing sentence or lang' });
  }

  const langName = lang === 'he' ? 'Hebrew' : 'English';

  const prompt = `You are a grammar checker for a children's word-building game. A child has arranged words into this sentence:

"${sentence}"

Language: ${langName}

Analyze if this is a grammatically correct and meaningful sentence in ${langName}.

Respond with ONLY a JSON object (no markdown, no code fences) in this exact format:
{
  "correct": true/false,
  "feedback": "short encouraging feedback message in ${langName} (1 sentence, simple words)",
  "suggestion": null or { "type": "insert" | "swap" | "reorder", "message": "explanation in ${langName}" }
}

Rules:
- Be encouraging but honest. This is for kids learning language.
- If correct, set "correct": true, give positive feedback, suggestion: null
- If incorrect, set "correct": false, explain what's wrong simply in the feedback, and if possible give a specific suggestion
- For the suggestion message, be very simple and clear — the child needs to understand
- Keep feedback under 15 words
- ONLY output the JSON object, nothing else`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const result = JSON.parse(text);
    res.json(result);
  } catch (err) {
    console.error('Grammar check error:', err);
    res.status(500).json({
      correct: false,
      feedback: lang === 'he' ? 'לא הצלחתי לבדוק, נסו שוב' : "Couldn't check, try again",
      suggestion: null,
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Grammar API running on http://localhost:${PORT}`);
});
