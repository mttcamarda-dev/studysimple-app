# StudySimple

Un'app per lo studio intelligente con AI, flashcard e ripetizione spaziata.

**100% GRATIS** - Usa Google Gemini AI (gratuito), Supabase (gratuito) e Vercel (gratuito).

## Funzionalita

- **Flashcard** - Crea e studia flashcard con ripetizione spaziata (algoritmo SM-2)
- **Generazione AI** - Genera automaticamente flashcard e riassunti dal testo
- **Tutor AI** - Chat con un tutor AI per spiegazioni e aiuto nello studio
- **Import OCR** - Carica immagini e estrai il testo automaticamente
- **Dashboard** - Traccia i tuoi progressi e le serie di studio
- **Tema scuro/chiaro** - Supporto per dark mode

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI**: Radix UI, shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5
- **AI**: Google Gemini (GRATIS!)
- **OCR**: Tesseract.js

---

## Deploy su Vercel (GRATIS)

### Passo 1: Crea Database su Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Clicca **New Project**
3. Scegli nome e password (SALVALA!)
4. Aspetta che si crei
5. Vai su **Project Settings** → **Database** → **Connection string** → **URI**
6. Copia la stringa e sostituisci `[YOUR-PASSWORD]` con la tua password

### Passo 2: Ottieni API Key Gemini (GRATIS)

1. Vai su [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Accedi con il tuo account Google
3. Clicca **Create API Key**
4. Copia la chiave

### Passo 3: Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi con GitHub
2. Clicca **Add New Project**
3. Importa il repository `studysimple-app`
4. Aggiungi le **Environment Variables**:

| Nome | Valore |
|------|--------|
| `DATABASE_URL` | La stringa di Supabase |
| `AUTH_SECRET` | Genera su [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) |
| `AUTH_URL` | `https://tuo-progetto.vercel.app` |
| `GEMINI_API_KEY` | La tua API key Gemini |

5. Clicca **Deploy**

### Passo 4: Inizializza Database

Dopo il deploy, devi creare le tabelle. Hai due opzioni:

**Opzione A - Dalla dashboard Vercel:**
1. Vai nel progetto su Vercel
2. Tab **Settings** → **Functions**
3. Apri la **Vercel CLI** o usa il terminale locale

**Opzione B - Da terminale locale:**
```bash
git clone <tuo-repo>
cd studysimple-app
npm install
# Crea .env.local con DATABASE_URL
npx prisma db push
```

### Fatto!

La tua app e online su `https://tuo-progetto.vercel.app`

---

## Setup Locale (per sviluppo)

```bash
# Clona
git clone <repo-url>
cd studysimple-app

# Installa
npm install

# Configura
cp .env.example .env.local
# Modifica .env.local con le tue credenziali

# Database
npx prisma db push

# Avvia
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## Struttura Progetto

```
studysimple-app/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Pagine dashboard protette
│   │   ├── dashboard/     # Home dashboard
│   │   ├── decks/         # Gestione mazzi
│   │   ├── study/         # Sessione studio
│   │   ├── chat/          # Chat AI tutor
│   │   └── import/        # Import contenuti
│   └── api/               # API Routes
├── components/            # Componenti React
│   ├── ui/               # Componenti UI base (shadcn)
│   ├── flashcards/       # Componenti flashcard
│   └── chat/             # Componenti chat
├── lib/                   # Utilities
│   ├── ai.ts             # Integrazione Gemini
│   ├── auth.ts           # Configurazione auth
│   └── db.ts             # Client Prisma
└── prisma/               # Schema database
```

---

## Costi

| Servizio | Costo |
|----------|-------|
| Vercel | Gratis |
| Supabase | Gratis (500MB) |
| Google Gemini | Gratis (60 req/min) |
| **Totale** | **0** |

---

## License

MIT
