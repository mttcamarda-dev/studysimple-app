"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Sparkles } from "lucide-react";
import type { Flashcard } from "@prisma/client";

interface FlashcardListProps {
  flashcards: Flashcard[];
  deckId: string;
}

export function FlashcardList({ flashcards, deckId }: FlashcardListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa carta?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/flashcards?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {flashcards.length} Carte
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {flashcards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{card.front}</p>
                  {card.aiGenerated && (
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </div>
              <div className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">{card.back}</p>
              </div>
              <div className="flex justify-end gap-2 p-2 border-t">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(card.id)}
                  disabled={deletingId === card.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
