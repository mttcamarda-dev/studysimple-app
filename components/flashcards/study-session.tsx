"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  BookOpen,
  Trophy,
} from "lucide-react";
import type { Flashcard, Deck, CardReview } from "@prisma/client";

interface StudySessionProps {
  cards: (Flashcard & { deck: Deck; reviews: CardReview[] })[];
  deckTitle?: string;
  deckId?: string;
}

type Rating = "again" | "hard" | "good" | "easy";

export function StudySession({ cards, deckTitle, deckId }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0,
  });
  const router = useRouter();

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: Rating) => {
    if (isSubmitting || !currentCard) return;

    setIsSubmitting(true);

    try {
      await fetch("/api/study/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          rating,
        }),
      });

      // Update results
      if (rating === "again") {
        setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      } else {
        setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }

      // Move to next card or complete
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900 p-6 mb-6">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tutto fatto!</h1>
        <p className="text-muted-foreground mb-6">
          Non hai carte da ripassare al momento. Torna piu tardi!
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline">Torna alla Dashboard</Button>
          </Link>
          <Link href="/decks">
            <Button>Sfoglia i Mazzi</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (completed) {
    const totalCards = results.correct + results.incorrect;
    const accuracy = totalCards > 0 ? Math.round((results.correct / totalCards) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sessione Completata!</h1>
        <p className="text-muted-foreground mb-6">
          Hai ripassato {totalCards} carte
        </p>

        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{results.correct}</div>
            <div className="text-sm text-muted-foreground">Corrette</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{results.incorrect}</div>
            <div className="text-sm text-muted-foreground">Da rivedere</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Precisione</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline">Torna alla Dashboard</Button>
          </Link>
          <Button onClick={() => router.refresh()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Studia Ancora
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={deckId ? `/decks/${deckId}` : "/decks"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">
              {deckTitle || "Tutte le Carte"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Carta {currentIndex + 1} di {cards.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600">{results.correct}</span>
          <span>/</span>
          <span className="text-red-600">{results.incorrect}</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div
        className="perspective cursor-pointer min-h-[300px]"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="min-h-[300px]">
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                <div className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
                  {isFlipped ? "Risposta" : "Domanda"}
                </div>
                <p className="text-xl">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
                {!isFlipped && (
                  <p className="text-sm text-muted-foreground mt-8">
                    Clicca per vedere la risposta
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating Buttons */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3"
        >
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-950"
            onClick={() => handleRating("again")}
            disabled={isSubmitting}
          >
            <XCircle className="h-5 w-5 text-red-600 mb-1" />
            <span className="text-xs">Ripeti</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 border-orange-200 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-800 dark:hover:bg-orange-950"
            onClick={() => handleRating("hard")}
            disabled={isSubmitting}
          >
            <span className="text-orange-600 font-medium mb-1">:/</span>
            <span className="text-xs">Difficile</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950"
            onClick={() => handleRating("good")}
            disabled={isSubmitting}
          >
            <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            <span className="text-xs">Bene</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:hover:bg-blue-950"
            onClick={() => handleRating("easy")}
            disabled={isSubmitting}
          >
            <Trophy className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs">Facile</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
