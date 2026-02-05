// Hugging Face Inference API Integration (FREE!)

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

async function callHuggingFace(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY not configured");
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("HuggingFace API error:", error);
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  return data.generated_text || "";
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(
  text: string,
  count: number = 5
): Promise<GeneratedFlashcard[]> {
  const prompt = `<s>[INST] Sei un assistente educativo. Genera esattamente ${count} flashcard dal testo seguente.
Rispondi SOLO con un array JSON valido, senza altro testo.
Formato: [{"front": "domanda", "back": "risposta"}]

Testo: ${text.slice(0, 3000)}

JSON: [/INST]`;

  const content = await callHuggingFace(prompt);

  try {
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
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
    brief: "Crea un riassunto breve (2-3 frasi) in italiano del seguente testo:",
    detailed: "Crea un riassunto dettagliato e ben strutturato in italiano del seguente testo:",
    bullet_points: "Crea un riassunto in punti elenco in italiano del seguente testo:",
  };

  const prompt = `<s>[INST] ${prompts[type]}

${text.slice(0, 3000)} [/INST]`;

  return await callHuggingFace(prompt);
}

export async function chatWithTutor(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
): Promise<string> {
  const systemContext = context
    ? `Sei un tutor amichevole che aiuta gli studenti. Contesto: ${context}`
    : "Sei un tutor amichevole che aiuta gli studenti con qualsiasi argomento.";

  const lastMessage = messages[messages.length - 1]?.content || "";

  const prompt = `<s>[INST] ${systemContext}

Rispondi in italiano in modo chiaro e utile.

Domanda dello studente: ${lastMessage} [/INST]`;

  return await callHuggingFace(prompt);
}

export async function generateQuiz(
  text: string,
  questionCount: number = 5
): Promise<{ question: string; options: string[]; correctIndex: number }[]> {
  const prompt = `<s>[INST] Genera ${questionCount} domande a scelta multipla dal testo.
Rispondi SOLO con un array JSON, senza altro testo.
Formato: [{"question": "domanda", "options": ["a", "b", "c", "d"], "correctIndex": 0}]

Testo: ${text.slice(0, 3000)}

JSON: [/INST]`;

  const content = await callHuggingFace(prompt);

  try {
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    console.error("Failed to parse quiz:", content);
    return [];
  }
}
