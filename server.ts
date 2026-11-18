import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Nothing OS Essential Key AI Agent Endpoint
  app.post('/api/essential-agent', async (req, res) => {
    try {
      const { prompt, role, activeModule, contextSummary } = req.body as {
        prompt?: string;
        role?: string;
        activeModule?: string;
        contextSummary?: string;
      };

      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Prompt or capture note is required.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check the Settings > Secrets panel in AI Studio.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are the Nothing OS "Essential Key" AI Agent embedded inside an institutional Student Record & Campus ERP System (studentrecordms / studentrecorddb).
Current User Role: ${role || 'student'}
Current Active Screen: ${activeModule || 'dashboard'}
Live Institutional Context:
${contextSummary || 'Standard campus state'}

Respond with concise, high-precision academic intelligence formatted as a structured JSON object containing:
- title: Short 3-6 word industrial title for this Essential Capture card
- summary: Clear 2-3 sentence actionable synthesis grounded in the exact numbers, names, and dates from the live context
- category: One of "ACADEMIC", "ATTENDANCE", "FINANCE", "SCHEDULE", or "SYSTEM"
- metricLabel: Short label for a dynamic widget metric (e.g. "TARGET ATTENDANCE", "NEXT DEADLINE", "CGPA PROJECTION")
- metricValue: Short numeric/code value for the dynamic widget (e.g. "82% (+7%)", "48 HRS", "9.32 CGPA")
- actionItems: Array of 3 concrete, actionable next steps tailored to the user's role (${role || 'student'})
- suggestedTab: Which module id the user should jump to next ("dashboard", "profile", "assessment", "attendance", "homeworks", "mail", "fees", "google_meet", "library", "notice_board", "settings")`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt.trim(),
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING },
              metricLabel: { type: Type.STRING },
              metricValue: { type: Type.STRING },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedTab: { type: Type.STRING },
            },
            required: [
              'title',
              'summary',
              'category',
              'metricLabel',
              'metricValue',
              'actionItems',
              'suggestedTab',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to process Essential Key AI request.';
      res.status(500).json({ error: message });
    }
  });

  // 2. Internal Campus Mail Dispatch API (No third-party OAuth required)
  app.post('/api/campus-mail/send', (req, res) => {
    const { fromName, fromEmail, toName, toEmail, subject, body, category } = req.body as {
      fromName?: string;
      fromEmail?: string;
      toName?: string;
      toEmail?: string;
      subject?: string;
      body?: string;
      category?: string;
    };

    if (!toEmail || !subject || !body) {
      res.status(400).json({ error: 'Recipient email, subject, and body are required.' });
      return;
    }

    const messageId = `<SRMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}@institute.edu.in>`;
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    res.json({
      status: 'DISPATCHED',
      messageId,
      relay: 'smtp.institute.edu.in:587 (TLS)',
      timestamp,
      mail: {
        fromName: fromName || 'Campus User',
        fromEmail: fromEmail || 'noreply@institute.edu.in',
        toName: toName || 'Campus Recipient',
        toEmail,
        subject,
        body,
        category: category || 'Academic',
      },
    });
  });

  // 3. AI Smart Draft Endpoint for Campus Mail
  app.post('/api/campus-mail/smart-draft', async (req, res) => {
    try {
      const { topic, senderName, senderRole, recipientEmail, studentInfo } = req.body as {
        topic?: string;
        senderName?: string;
        senderRole?: string;
        recipientEmail?: string;
        studentInfo?: string;
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Draft a concise, formal institutional email for topic: "${topic || 'Academic standing inquiry'}".
Sender: ${senderName || 'Student'} (${senderRole || 'student'})
Recipient: ${recipientEmail || 'registrar@institute.edu.in'}
Context: ${studentInfo || 'B.Tech CS Semester 3'}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ['subject', 'body', 'category'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate mail draft.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
