"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Question } from "../service/manage-question-service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSave: (id: string, data: Omit<Question, "id">) => Promise<void>;
};

export default function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: Props) {
  const [text, setText] = useState("");
  const [mediaType, setMediaType] = useState("");

  // Fast Accuracy
  const [itemA, setItemA] = useState("");
  const [itemB, setItemB] = useState("");
  const [fastAccAnswer, setFastAccAnswer] = useState("");

  // CAAS
  const [caasOptions, setCaasOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  // DISC
  const [discOptions, setDiscOptions] = useState({
    D: "",
    I: "",
    S: "",
    C: "",
  });

  // Prefill kalau question ada
  useEffect(() => {
    if (!question) return;
    setText(question.text);
    setMediaType(question.mediaType ?? "");

    if (question.type === "Fast Accuracy") {
      setItemA(question.options?.A ?? "");
      setItemB(question.options?.B ?? "");
      setFastAccAnswer(question.answer ?? "");
    } else if (question.type === "CAAS") {
      const letters = ["A", "B", "C", "D"];
      setCaasOptions(
        letters.map((l) => ({
          text: question.options?.[l] ?? "",
          isCorrect: question.answer === l,
        }))
      );
    } else if (question.type === "DISC") {
      setDiscOptions({
        D: question.options?.D ?? "",
        I: question.options?.I ?? "",
        S: question.options?.S ?? "",
        C: question.options?.C ?? "",
      });
    }
  }, [question, open]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question) return;

    const payload: Omit<Question, "id"> = {
      type: question.type,
      text,
      mediaType: mediaType as "image" | "audio" | "video" | undefined,
      category: question.category,
      options: undefined,
      answer: undefined,
    };

    if (question.type === "Fast Accuracy") {
      payload.options = { A: itemA, B: itemB };
      payload.answer = fastAccAnswer;
    } else if (question.type === "CAAS") {
      const options: Record<string, string> = {};
      const letters = ["A", "B", "C", "D"];
      caasOptions.forEach((opt, i) => (options[letters[i]] = opt.text));
      payload.options = options;
      const correctIndex = caasOptions.findIndex((o) => o.isCorrect);
      payload.answer = correctIndex !== -1 ? letters[correctIndex] : "";
    } else if (question.type === "DISC") {
      payload.options = discOptions;
    }

    await onSave(question.id, payload);
    onOpenChange(false);
  }

  const updateCaasOption = (index: number, text: string) => {
    const newOptions = [...caasOptions];
    newOptions[index].text = text;
    setCaasOptions(newOptions);
  };

  const setCaasCorrect = (index: number) => {
    setCaasOptions((prev) =>
      prev.map((o, i) => ({ ...o, isCorrect: i === index }))
    );
  };

  const discLabels = {
    D: "(D)",
    I: "(I)",
    S: "(S)",
    C: "(C)",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Edit Question {question?.type && `(${question.type})`}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-scroll">
          <form onSubmit={handleSave} className="px-6 py-6 space-y-8">
            {/* Fast Accuracy */}
            {question?.type === "Fast Accuracy" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Item A</Label>
                  <Input
                    value={itemA}
                    onChange={(e) => setItemA(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Item B</Label>
                  <Input
                    value={itemB}
                    onChange={(e) => setItemB(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <RadioGroup
                    value={fastAccAnswer}
                    onValueChange={setFastAccAnswer}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false">False</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* CAAS */}
            {question?.type === "CAAS" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <Label>Answers</Label>
                  {caasOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-md"
                    >
                      <Input
                        value={option.text}
                        onChange={(e) => updateCaasOption(index, e.target.value)}
                        className="flex-1"
                      />
                      <RadioGroup
                        value={option.isCorrect ? String(index) : ""}
                        onValueChange={() => setCaasCorrect(index)}
                      >
                        <RadioGroupItem value={String(index)} id={`caas-${index}`} />
                      </RadioGroup>
                      {option.isCorrect && (
                        <Badge className="bg-blue-100 text-blue-700">Correct</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DISC */}
            {question?.type === "DISC" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <Label>Answers</Label>
                  {Object.entries(discOptions).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 border rounded-md"
                    >
                      <Input
                        value={value}
                        onChange={(e) =>
                          setDiscOptions({ ...discOptions, [key]: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge variant="outline">
                        {discLabels[key as keyof typeof discLabels]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
