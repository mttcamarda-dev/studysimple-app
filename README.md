# StudySimple

Un'app per lo studio intelligente con AI, flashcard e ripetizione spaziata.

## Funzionalita

- **Importazione contenuti** - Carica immagini e usa l'OCR per estrarre il testo
- **Generazione AI** - Crea automaticamente flashcard e riassunti dal testo
- **Sistema flashcard** - Ripetizione spaziata con algoritmo SM-2
- **Tutor AI** - Chat con un tutor AI per spiegazioni e aiuto nello studio
- **Dashboard** - Traccia i tuoi progressi e le serie di studio

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Database**: PostgreSQL con Prisma ORM
- **Auth**: NextAuth.js v5
- **AI**: OpenAI GPT-3.5/4
- **OCR**: Tesseract.js

## Setup Locale

### Prerequisiti

- Node.js 18+
- PostgreSQL database (o usa [Supabase](https://supabase.com) / [Neon](https://neon.tech) gratuito)
- OpenAI API key

### Installazione

1. **Clona il repository**
   ```bash
   git clone <repo-url>
   cd studysimple-app
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   cp .env.example .env.local
   ```

   Modifica `.env.local` con le tue credenziali:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Auth
   AUTH_SECRET="genera-con-openssl-rand-base64-32"
   AUTH_URL="http://localhost:3000"

   # OpenAI
   OPENAI_API_KEY="sk-..."
   ```

4. **Setup database**
   ```bash
   npx prisma db push
   ```

5. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

6. Apri [http://localhost:3000](http://localhost:3000)

## Deploy su Vercel

### 1. Database

Crea un database PostgreSQL gratuito:
- [Supabase](https://supabase.com) - Consigliato
- [Neon](https://neon.tech)
- [PlanetScale](https://planetscale.com) (MySQL)

### 2. Deploy

1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository da GitHub
3. Configura le variabili d'ambiente:
   - `DATABASE_URL` - URL del tuo database
   - `AUTH_SECRET` - Genera con `openssl rand -base64 32`
   - `AUTH_URL` - URL del tuo sito Vercel (es. `https://studysimple.vercel.app`)
   - `OPENAI_API_KEY` - La tua API key OpenAI
4. Deploy!

### 3. Dopo il Deploy

Esegui le migrazioni del database:
```bash
npx prisma db push
```

## Struttura Progetto

```
studysimple-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pagine autenticazione
│   ├── (dashboard)/       # Pagine dashboard protette
│   └── api/               # API Routes
├── components/            # Componenti React
│   ├── ui/               # Componenti UI base
│   ├── dashboard/        # Componenti dashboard
│   ├── flashcards/       # Componenti flashcard
│   ├── chat/             # Componenti chat
│   └── import/           # Componenti importazione
├── lib/                   # Utilities e configurazioni
├── prisma/               # Schema database
└── types/                # TypeScript types
```

## API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/auth/*` | * | NextAuth handlers |
| `/api/decks` | GET/POST | Lista/crea mazzi |
| `/api/flashcards` | POST/PUT/DELETE | CRUD flashcard |
| `/api/study/review` | POST | Registra review |
| `/api/ai/generate-flashcards` | POST | Genera flashcard con AI |
| `/api/ai/generate-summary` | POST | Genera riassunto con AI |
| `/api/chat` | GET/POST | Chat con tutor AI |

## Contribuire

1. Fork il repository
2. Crea un branch (`git checkout -b feature/nuova-feature`)
3. Commit le modifiche (`git commit -m 'Aggiunge nuova feature'`)
4. Push al branch (`git push origin feature/nuova-feature`)
5. Apri una Pull Request

## License

MIT
