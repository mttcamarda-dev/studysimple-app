import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Plus, Sparkles } from "lucide-react";
import { FlashcardList } from "@/components/flashcards/flashcard-list";
import { CreateCardDialog } from "@/components/flashcards/create-card-dialog";
import { GenerateCardsDialog } from "@/components/flashcards/generate-cards-dialog";

interface DeckPageProps {
  params: { id: string };
}

async function getDeck(id: string, userId: string) {
  return db.deck.findFirst({
    where: { id, userId },
    include: {
      flashcards: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function DeckPage({ params }: DeckPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const deck = await getDeck(params.id, userId);

  if (!deck) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/decks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: deck.color }}
            />
            <h1 className="text-2xl font-bold">{deck.title}</h1>
          </div>
          {deck.description && (
            <p className="text-muted-foreground mt-1">{deck.description}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {deck.flashcards.length > 0 && (
          <Link href={`/study?deckId=${deck.id}`}>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Studia ({deck.flashcards.length} carte)
            </Button>
          </Link>
        )}
        <CreateCardDialog deckId={deck.id}>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Aggiungi Carta
          </Button>
        </CreateCardDialog>
        <GenerateCardsDialog deckId={deck.id}>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Genera con AI
          </Button>
        </GenerateCardsDialog>
      </div>

      {/* Flashcards */}
      {deck.flashcards.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nessuna carta ancora</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aggiungi flashcard manualmente o generale con l&apos;AI
            </p>
            <div className="flex gap-3">
              <CreateCardDialog deckId={deck.id}>
                <Button>Aggiungi Carta</Button>
              </CreateCardDialog>
              <GenerateCardsDialog deckId={deck.id}>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Genera con AI
                </Button>
              </GenerateCardsDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <FlashcardList flashcards={deck.flashcards} deckId={deck.id} />
      )}
    </div>
  );
}
