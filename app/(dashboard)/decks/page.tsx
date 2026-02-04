import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CreateDeckDialog } from "@/components/flashcards/create-deck-dialog";

async function getDecks(userId: string) {
  return db.deck.findMany({
    where: { userId },
    include: {
      _count: { select: { flashcards: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function DecksPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const decks = await getDecks(userId);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">I Miei Mazzi</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi mazzi di flashcard
          </p>
        </div>
        <CreateDeckDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuovo Mazzo
          </Button>
        </CreateDeckDialog>
      </div>

      {decks.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nessun mazzo ancora</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea il tuo primo mazzo di flashcard per iniziare a studiare
            </p>
            <CreateDeckDialog>
              <Button>Crea il Primo Mazzo</Button>
            </CreateDeckDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div
                    className="h-2 w-16 rounded-full mb-2"
                    style={{ backgroundColor: deck.color }}
                  />
                  <CardTitle>{deck.title}</CardTitle>
                  {deck.description && (
                    <CardDescription>{deck.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {deck._count.flashcards} carte
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
