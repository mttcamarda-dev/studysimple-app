import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";

async function getStats(userId: string) {
  const [decks, dueCards, streak] = await Promise.all([
    db.deck.findMany({
      where: { userId },
      include: { _count: { select: { flashcards: true } } },
    }),
    db.cardReview.count({
      where: {
        userId,
        nextReview: { lte: new Date() },
      },
    }),
    db.studyStreak.findUnique({ where: { userId } }),
  ]);

  const totalCards = decks.reduce((acc, deck) => acc + deck._count.flashcards, 0);

  return {
    totalDecks: decks.length,
    totalCards,
    cardsToReview: dueCards,
    streak: streak?.currentStreak || 0,
    totalMinutes: streak?.totalMinutes || 0,
    recentDecks: decks.slice(0, 3),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const stats = await getStats(userId);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Ciao, {session.user?.name?.split(" ")[0] || "Studente"}!
        </h1>
        <p className="text-muted-foreground">
          Ecco un riepilogo del tuo apprendimento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mazzi</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDecks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCards} carte totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Da Ripassare</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cardsToReview}</div>
            <p className="text-xs text-muted-foreground">carte da rivedere oggi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Serie</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">giorni consecutivi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Studio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMinutes}</div>
            <p className="text-xs text-muted-foreground">minuti totali</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Nuovo Mazzo</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Crea un nuovo mazzo di flashcard
            </p>
            <Link href="/decks/new">
              <Button>Crea Mazzo</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Importa Contenuti</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Carica immagini e genera flashcard con AI
            </p>
            <Link href="/import">
              <Button variant="outline">Importa</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Chiedi al Tutor</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Fai domande al tutor AI
            </p>
            <Link href="/chat">
              <Button variant="outline">Inizia Chat</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Study Now CTA */}
      {stats.cardsToReview > 0 && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="text-xl font-bold">Hai {stats.cardsToReview} carte da ripassare!</h3>
              <p className="opacity-90">Mantieni viva la tua serie di studio</p>
            </div>
            <Link href="/study">
              <Button variant="secondary" size="lg" className="gap-2">
                Studia Ora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Decks */}
      {stats.recentDecks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">I Tuoi Mazzi</h2>
            <Link href="/decks">
              <Button variant="ghost" size="sm" className="gap-1">
                Vedi tutti <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.recentDecks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div
                      className="h-2 w-12 rounded-full mb-2"
                      style={{ backgroundColor: deck.color }}
                    />
                    <CardTitle className="text-lg">{deck.title}</CardTitle>
                    <CardDescription>
                      {deck._count.flashcards} carte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      0% completato
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
