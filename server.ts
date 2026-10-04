import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let port = parseInt(process.env.PORT || '3000', 10);
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  port = parseInt(process.argv[portArgIndex + 1], 10);
}
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Secure Server-Side Groq API Handler
const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  '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';

// Helper function to call Groq API
async function callGroqChat(messages: Array<{ role: string; content: string }>, model = 'qwen/qwen3.8-27b', temperature = 0.3) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// 1. Academic Proofreading & Abstract Enhancement API
app.post('/api/ai/proofread', async (req: Request, res: Response) => {
  try {
    const { text, task = 'proofread', targetLang = 'ar' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for processing' });
    }

    let systemPrompt = `You are a distinguished senior academic editor for the "Archives of Agriculture Sciences Journal (AASJ)" published by the Faculty of Agriculture, Al-Azhar University. You adhere strictly to high-standard scientific academic style, correct grammar, terminology in agricultural sciences, and clarity.`;

    let userPrompt = '';
    if (task === 'proofread') {
      userPrompt = `Please carefully proofread and enhance the following academic text for the AASJ journal. Correct any grammatical, typographical, or stylistic weaknesses, and improve scientific cohesion without altering the original research meaning. Return the improved text clearly followed by a brief bulleted summary of key improvements:\n\n${text}`;
    } else if (task === 'polish_abstract') {
      userPrompt = `Please polish and restructure this scientific research abstract to meet international journal standards (Background/Objective, Methods, Key Findings, Conclusion). Make the language professional, academic, and clear:\n\n${text}`;
    } else if (task === 'translate_en') {
      userPrompt = `Translate this Arabic agricultural research abstract into prestigious, high-standard academic English suitable for indexing in EKB and international databases:\n\n${text}`;
    } else if (task === 'translate_ar') {
      userPrompt = `Translate this English agricultural research abstract into precise, professional Arabic academic prose suitable for Al-Azhar University Journal (AASJ):\n\n${text}`;
    } else if (task === 'extract_keywords') {
      userPrompt = `Extract 5 to 7 high-impact academic keywords in both Arabic and English suitable for indexing this agricultural manuscript:\n\n${text}`;
    } else {
      userPrompt = `Refine and improve this academic text:\n\n${text}`;
    }

    const result = await callGroqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Proofreading API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal error processing proofreading request',
    });
  }
});

// 2. Smart Reviewer Matching API
app.post('/api/ai/match-reviewers', async (req: Request, res: Response) => {
  try {
    const { manuscriptTitle, abstract, sectionName, reviewers } = req.body;

    if (!manuscriptTitle || !reviewers || !Array.isArray(reviewers)) {
      return res.status(400).json({ error: 'Manuscript details and reviewers list are required' });
    }

    const reviewersSummary = reviewers
      .map((r: any, idx: number) => {
        return `[ID: ${r.id}] Name: ${r.name}, Affiliation: ${r.affiliation || 'University'}, Specialization: ${r.specialization || 'Agriculture'}, Sub-specialty: ${r.subSpecialty || 'General'}, Completed Reviews: ${r.completedReviews || 0}, Rating: ${r.rating || 5}/5, Turnaround: ${r.avgTurnaroundDays || 14} days`;
      })
      .join('\n');

    const prompt = `You are the Editor-in-Chief AI Assistant of the Archives of Agriculture Sciences Journal (AASJ).
Given the following manuscript information:
- Title: ${manuscriptTitle}
- Section: ${sectionName || 'Agricultural Sciences'}
- Abstract: ${abstract || 'N/A'}

And the list of available reviewers:
${reviewersSummary}

Task: Recommend the top 3 best-suited reviewers to review this specific manuscript based on sub-specialty relevance, review history, and turnaround speed.

Output your response ONLY as valid JSON in this exact structure:
{
  "matches": [
    {
      "reviewerId": "string (the exact ID from the list)",
      "matchScore": number (between 70 and 99),
      "reasonAr": "سبب الترشيح باللغة العربية (جملة علمية موجزة وواضحة)",
      "reasonEn": "Brief matching rationale in English"
    }
  ],
  "editorialTip": "نصيحة تحريرية موجزة بخصوص تحكيم هذا البحث"
}`;

    const rawResponse = await callGroqChat(
      [
        {
          role: 'system',
          content: 'You output strictly valid JSON without markdown fences or additional commentary.',
        },
        { role: 'user', content: prompt },
      ],
      'qwen/qwen3.8-27b',
      0.1
    );

    // Clean JSON response if enclosed in ```json ```
    const cleaned = rawResponse
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Smart Reviewer Matching API error:', error);
    return res.status(500).json({
      error: error.message || 'Error processing reviewer matching request',
    });
  }
});

// Full-Stack Server Integration
async function startServer() {
  if (!isProd) {
    // Vite Dev Server middleware mode (HMR is disabled in AI Studio)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static production build serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`> AASJ Server ready on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
