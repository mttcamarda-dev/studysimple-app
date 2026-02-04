"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateCardsDialogProps {
  deckId: string;
  children: React.ReactNode;
}

export function GenerateCardsDialog({ deckId, children }: GenerateCardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState<number>(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setGenerated(0);

    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, deckId, count }),
      });

      if (response.ok) {
        const data = await response.json();
        setGenerated(data.flashcards?.length || 0);

        setTimeout(() => {
          setOpen(false);
          setText("");
          setGenerated(0);
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Genera Flashcard Automaticamente
            </DialogTitle>
            <DialogDescription>
              Incolla il testo dei tuoi appunti e verranno generate automaticamente
              le flashcard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Testo di origine</Label>
              <Textarea
                id="text"
                placeholder="Incolla qui il testo dei tuoi appunti, libro, o materiale di studio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Numero di carte da generare</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
          <DialogFooter>
            {generated > 0 ? (
              <p className="text-green-600 font-medium">
                {generated} carte generate con successo!
              </p>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Genera Flashcard
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
