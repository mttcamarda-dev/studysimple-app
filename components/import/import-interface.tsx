"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import type { Deck } from "@prisma/client";

interface ImportInterfaceProps {
  decks: Deck[];
}

export function ImportInterface({ decks }: ImportInterfaceProps) {
  const [text, setText] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

  const processImage = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrProgress(0);
    setPreviewImage(URL.createObjectURL(file));

    try {
      const worker = await createWorker("ita+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text: extractedText } } = await worker.recognize(file);
      await worker.terminate();

      setText((prev) => (prev ? prev + "\n\n" + extractedText : extractedText));
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(100);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        processImage(file);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const handleGenerateFlashcards = async () => {
    if (!text.trim() || !selectedDeckId) return;

    setIsGenerating(true);
    setGeneratedCount(0);

    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          deckId: selectedDeckId,
          count: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCount(data.flashcards?.length || 0);

        setTimeout(() => {
          router.push(`/decks/${selectedDeckId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummary = async (type: "brief" | "detailed" | "bullet_points") => {
    if (!text.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setText(data.summary);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importa Contenuti</h1>
        <p className="text-muted-foreground">
          Carica immagini o incolla testo per generare flashcard e riassunti con l&apos;AI
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload" className="gap-2">
            <Camera className="h-4 w-4" />
            Carica Immagine
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Incolla Testo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                {isProcessingOCR ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <p className="font-medium">Estrazione testo in corso...</p>
                    <Progress value={ocrProgress} className="max-w-xs mx-auto" />
                    <p className="text-sm text-muted-foreground">{ocrProgress}%</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium mb-2">
                      {isDragActive
                        ? "Rilascia qui le immagini"
                        : "Trascina qui le immagini o clicca per caricare"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supporta: JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </div>

              {previewImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Anteprima:</p>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-48 rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Card>
            <CardContent className="pt-6">
              <Label htmlFor="text-input">Incolla il tuo testo qui</Label>
              <Textarea
                id="text-input"
                placeholder="Incolla qui i tuoi appunti, testi da libri, o qualsiasi contenuto di studio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] mt-2"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Extracted/Pasted Text */}
      {text && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Testo Estratto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
              placeholder="Il testo estratto apparira qui..."
            />
            <p className="text-sm text-muted-foreground">
              {text.split(/\s+/).filter(Boolean).length} parole
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {text && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Genera con AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generate Flashcards */}
            <div className="space-y-3">
              <Label>Genera Flashcard</Label>
              <div className="flex gap-3">
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona mazzo" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={!selectedDeckId || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : generatedCount > 0 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {generatedCount} carte create!
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Genera Flashcard
                    </>
                  )}
                </Button>
              </div>
              {decks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Crea prima un mazzo nella sezione &quot;I Miei Mazzi&quot;
                </p>
              )}
            </div>

            {/* Generate Summary */}
            <div className="space-y-3">
              <Label>Genera Riassunto</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateSummary("brief")}
                  disabled={isGenerating}
                >
                  Breve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateSummary("detailed")}
                  disabled={isGenerating}
                >
                  Dettagliato
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateSummary("bullet_points")}
                  disabled={isGenerating}
                >
                  Punti Elenco
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
