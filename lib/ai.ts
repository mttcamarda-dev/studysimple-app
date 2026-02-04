import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(
  text: string,
  count: number = 5
): Promise<GeneratedFlashcard[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Sei un assistente educativo esperto. Genera ${count} flashcard dal testo fornito.
Ogni flashcard deve avere una domanda chiara (front) e una risposta concisa ma completa (back).
Rispondi SOLO con un array JSON valido nel formato:
[{"front": "domanda", "back": "risposta"}]
Non includere altro testo, solo il JSON.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "[]";

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

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Sei un assistente educativo esperto nel creare riassunti chiari e utili per lo studio.",
      },
      {
        role: "user",
        content: `${prompts[type]}\n\n${text}`,
      },
    ],
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content || "";
}

export async function chatWithTutor(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
): Promise<string> {
  const systemMessage = context
    ? `Sei un tutor AI amichevole e paziente. Aiuti gli studenti a comprendere meglio i loro materiali di studio.
Contesto dello studio dell'utente:
${context}

Rispondi sempre in italiano, spiega i concetti passo-passo e usa esempi quando possibile.`
    : `Sei un tutor AI amichevole e paziente. Aiuti gli studenti con qualsiasi argomento di studio.
Rispondi sempre in italiano, spiega i concetti passo-passo e usa esempi quando possibile.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "Mi dispiace, non sono riuscito a generare una risposta.";
}

export async function generateQuiz(
  text: string,
  questionCount: number = 5
): Promise<{ question: string; options: string[]; correctIndex: number }[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Genera ${questionCount} domande a scelta multipla dal testo fornito.
Ogni domanda deve avere 4 opzioni con una sola risposta corretta.
Rispondi SOLO con un array JSON nel formato:
[{"question": "domanda", "options": ["a", "b", "c", "d"], "correctIndex": 0}]
correctIndex è l'indice (0-3) della risposta corretta.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "[]";

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
