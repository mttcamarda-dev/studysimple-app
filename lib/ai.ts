// Google Gemini AI Integration (FREE!)
// Get your free API key at: https://makersuite.google.com/app/apikey

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const contents = [];

  if (systemPrompt) {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Capito, seguirò queste istruzioni." }]
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(
  text: string,
  count: number = 5
): Promise<GeneratedFlashcard[]> {
  const systemPrompt = `Sei un assistente educativo esperto. Genera ${count} flashcard dal testo fornito.
Ogni flashcard deve avere una domanda chiara (front) e una risposta concisa ma completa (back).
Rispondi SOLO con un array JSON valido nel formato:
[{"front": "domanda", "back": "risposta"}]
Non includere altro testo, markdown o spiegazioni. Solo il JSON puro.`;

  const content = await callGemini(text, systemPrompt);

  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    console.error("Failed to parse flashcards:", content);
    return [];
  }
}

export async function generateSummary(
  text: string,
  type: "brief" | "detailed" | "bullet_points" = "detailed"
): Promise<string> {
  const prompts = {
    brief: "Crea un riassunto breve (2-3 frasi) del seguente testo:",
    detailed: "Crea un riassunto dettagliato e ben strutturato del seguente testo:",
    bullet_points: "Crea un riassunto in punti elenco del seguente testo:",
  };

  const systemPrompt = "Sei un assistente educativo esperto nel creare riassunti chiari e utili per lo studio. Rispondi sempre in italiano.";

  return await callGemini(`${prompts[type]}\n\n${text}`, systemPrompt);
}

export async function chatWithTutor(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
): Promise<string> {
  const systemPrompt = context
    ? `Sei un tutor AI amichevole e paziente. Aiuti gli studenti a comprendere meglio i loro materiali di studio.
Contesto dello studio dell'utente:
${context}

Rispondi sempre in italiano, spiega i concetti passo-passo e usa esempi quando possibile.`
    : `Sei un tutor AI amichevole e paziente. Aiuti gli studenti con qualsiasi argomento di studio.
Rispondi sempre in italiano, spiega i concetti passo-passo e usa esempi quando possibile.`;

  // Build conversation history
  const conversationText = messages
    .map((m) => `${m.role === "user" ? "Studente" : "Tutor"}: ${m.content}`)
    .join("\n\n");

  const prompt = `Questa è la conversazione finora:\n\n${conversationText}\n\nRispondi come Tutor all'ultimo messaggio dello studente.`;

  return await callGemini(prompt, systemPrompt);
}

export async function generateQuiz(
  text: string,
  questionCount: number = 5
): Promise<{ question: string; options: string[]; correctIndex: number }[]> {
  const systemPrompt = `Genera ${questionCount} domande a scelta multipla dal testo fornito.
Ogni domanda deve avere 4 opzioni con una sola risposta corretta.
Rispondi SOLO con un array JSON nel formato:
[{"question": "domanda", "options": ["a", "b", "c", "d"], "correctIndex": 0}]
correctIndex è l'indice (0-3) della risposta corretta.
Non includere altro testo, markdown o spiegazioni. Solo il JSON puro.`;

  const content = await callGemini(text, systemPrompt);

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    console.error("Failed to parse quiz:", content);
    return [];
  }
}
