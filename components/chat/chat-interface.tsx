"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Plus,
  Loader2,
  Brain,
  User,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatSession } from "@prisma/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  initialSessions: (ChatSession & { _count: { messages: number } })[];
}

export function ChatInterface({ initialSessions }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(sessionId);
        setMessages(
          session.messages.map((m: any) => ({
            role: m.role.toLowerCase(),
            content: m.content,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);

        // Update sessions list if new session
        if (!currentSessionId) {
          setSessions((prev) => [
            {
              id: data.sessionId,
              title: userMessage.slice(0, 50),
              userId: "",
              documentId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              _count: { messages: 2 },
            },
            ...prev,
          ]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Mi dispiace, si e verificato un errore. Riprova.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Sidebar - Chat History */}
      <Card className="hidden md:flex w-64 flex-col">
        <div className="p-4 border-b">
          <Button onClick={startNewChat} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nuova Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm">
                    {session.title || "Nuova conversazione"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {session._count.messages} messaggi
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Assistente Studio</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Ciao! Posso aiutarti a capire meglio qualsiasi argomento
              di studio. Fammi una domanda!
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {[
                "Spiegami la fotosintesi",
                "Come funziona il teorema di Pitagora?",
                "Riassumi la Seconda Guerra Mondiale",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setInput(suggestion)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-4 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
