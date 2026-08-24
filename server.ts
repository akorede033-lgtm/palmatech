import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client lazy / safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
  });
}

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Agronomist Assistant API Endpoint
app.post('/api/agronomist', async (req, res) => {
  try {
    const { prompt, contextType, blockData, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "PalmBot", an expert Commercial Oil Palm Agronomist & Plantation Management AI Advisor for a 500-hectare commercial palm estate.
Your advice must be precise, actionable, scientific, and realistic for commercial oil palm cultivation (Elaeis guineensis).
Topics include:
- Fresh Fruit Bunch (FFB) yield optimization and ripeness standards (Deep orange red, 5-10 loose fruits fallen)
- Nutrient management & fertilizer scheduling (NPK, MOP, Kieserite, Boron)
- Integrated Pest & Disease Management (IPM): Ganoderma boninense basal stem rot, Oryctes rhinoceros rhinoceros beetles, Metisa plana bagworms, Tirathaba moths, rats
- Drainage management for mineral vs peat soils, road upkeep, harvesting frond pruning techniques
- Worker safety, ergonomics, harvesting pole handling, PPE compliance
- Economic cost per hectare calculation and harvest logistics

Always format responses clearly with Markdown, using bullet points, bold headers, and practical step-by-step action plans.`;

    let contents: any = prompt;

    if (imageBase64) {
      const mimeType = imageBase64.startsWith('data:image/png')
        ? 'image/png'
        : 'image/jpeg';
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      contents = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this farm image / photo in context of ${contextType || 'Palm Plantation Inspection'}.\nPrompt / Question: ${prompt}\n${blockData ? `Block details: ${JSON.stringify(blockData)}` : ''}`,
          },
        ],
      };
    } else if (blockData) {
      contents = `Context Block Data: ${JSON.stringify(blockData)}\n\nQuery: ${prompt}`;
    }
let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    break;
  } catch (error: any) {
    const isTemporaryError =
      error?.status === 503 ||
      error?.status === 429 ||
      error?.message?.includes('high demand');

    if (!isTemporaryError || attempt === 3) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }
}
    return res.json({
      text: response.text || 'No response generated from Agronomist AI.',
    });
  } catch (error: any) {
    console.error('Agronomist AI Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate agronomist recommendation',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌴 Digital Farm Management Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
