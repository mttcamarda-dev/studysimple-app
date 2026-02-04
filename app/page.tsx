import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  MessageSquare,
  Camera,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">StudySimple</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Accedi</Button>
            </Link>
            <Link href="/login">
              <Button>Inizia Gratis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Studia in modo{" "}
            <span className="text-primary">intelligente</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Trasforma i tuoi appunti in flashcard, riassunti e quiz con l&apos;AI.
            Memorizza meglio con la ripetizione spaziata.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Inizia Ora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Scopri di piu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold">
          Tutto cio che ti serve per studiare
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          StudySimple combina le migliori tecniche di apprendimento con l&apos;intelligenza
          artificiale per aiutarti a studiare meglio.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Importa con la Fotocamera</h3>
              <p className="mt-2 text-muted-foreground">
                Scatta una foto ai tuoi appunti o libri. L&apos;OCR estrae il testo
                automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Flashcard con AI</h3>
              <p className="mt-2 text-muted-foreground">
                L&apos;AI genera automaticamente flashcard, riassunti e quiz dai tuoi
                contenuti.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ripetizione Spaziata</h3>
              <p className="mt-2 text-muted-foreground">
                Algoritmo SM-2 per mostrarti le carte al momento giusto e
                massimizzare la memorizzazione.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Tutor AI</h3>
              <p className="mt-2 text-muted-foreground">
                Chiedi spiegazioni al tutor AI. Ti aiuta a capire meglio qualsiasi
                argomento.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Riassunti Intelligenti</h3>
              <p className="mt-2 text-muted-foreground">
                Genera riassunti strutturati in pochi secondi. Brevi, dettagliati o
                a punti.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quiz Interattivi</h3>
              <p className="mt-2 text-muted-foreground">
                Metti alla prova le tue conoscenze con quiz generati
                automaticamente dall&apos;AI.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Pronto a studiare meglio?</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-90">
            Unisciti a migliaia di studenti che usano StudySimple per migliorare
            i loro risultati accademici.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="mt-8">
              Crea Account Gratuito
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 StudySimple. Studia in modo intelligente.</p>
        </div>
      </footer>
    </div>
  );
}
