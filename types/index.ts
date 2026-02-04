import type {
  User,
  Deck,
  Flashcard,
  Document,
  ChatSession,
  ChatMessage,
  CardReview,
  StudyStreak,
} from "@prisma/client";

export type { User, Deck, Flashcard, Document, ChatSession, ChatMessage, CardReview, StudyStreak };

export interface DeckWithCards extends Deck {
  flashcards: Flashcard[];
  _count?: {
    flashcards: number;
  };
}

export interface FlashcardWithReview extends Flashcard {
  reviews: CardReview[];
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface StudyStats {
  totalDecks: number;
  totalCards: number;
  cardsToReview: number;
  streak: number;
  totalMinutes: number;
}

export interface DueCard {
  flashcard: Flashcard;
  deck: Deck;
  lastReview?: CardReview;
}
