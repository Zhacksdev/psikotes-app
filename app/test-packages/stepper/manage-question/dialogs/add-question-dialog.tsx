"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon } from "lucide-react";
import type {
  Question,
  QuestionType,
} from "../service/manage-question-service";

type AddQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: QuestionType;
  onSave: (data: Omit<Question, "id">) => Promise<void>;
};

export default function AddQuestionDialog({
  open,
  onOpenChange,
  activeType,
  onSave,
}: AddQuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: Omit<Question, "id"> = {
      type: activeType,
      text: questionText,
      mediaType: mediaType
        ? (mediaType as "image" | "audio" | "video")
        : undefined,
      category: "-",
      options: undefined,
      answer: undefined,
    };

    if (activeType === "Fast Accuracy") {
      payload.options = { A: itemA, B: itemB };
      payload.answer = fastAccAnswer;
    } else if (activeType === "CAAS") {
      const options: Record<string, string> = {};
      const letters = ["A", "B", "C", "D"];
      caasOptions.forEach((option, index) => {
        options[letters[index]] = option.text;
      });
      payload.options = options;
      const correctIndex = caasOptions.findIndex((opt) => opt.isCorrect);
      payload.answer = correctIndex !== -1 ? letters[correctIndex] : "";
    } else if (activeType === "DISC") {
      payload.options = discOptions;
    }

    await onSave(payload);
    onOpenChange(false);
  }

  const updateCaasOption = (index: number, text: string) => {
    const newOptions = [...caasOptions];
    newOptions[index].text = text;
    setCaasOptions(newOptions);
  };

  const setCaasCorrect = (index: number) => {
    const newOptions = caasOptions.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setCaasOptions(newOptions);
  };

  const discLabels = {
    D: "(D)",
    I: "(I)",
    S: "(S)",
    C: "(C)",
  };

  const discPlaceholder = {
    D: "Dominance",
    I: "Influence",
    S: "Steadiness",
    C: "Conscientiousness",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        {/* HEADER sticky */}
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Add Question <span className="text-blue-600">{activeType}</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY scrollable */}
        <ScrollArea className="flex-1 overflow-y-scroll">
          <form onSubmit={handleSave} className="px-6 py-6 space-y-8">
            {/* Fast Accuracy */}
            {activeType === "Fast Accuracy" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Item A</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Sunflower"
                      value={itemA}
                      onChange={(e) => setItemA(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Item B</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter number, word, or short desc"
                      value={itemB}
                      onChange={(e) => setItemB(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" /> Upload
                    </Button>
                  </div>
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
            {activeType === "CAAS" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    placeholder="Saya merasa nyaman mengikuti aturan yang sudah ada"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Media (optional)</Label>
                  <div className="flex gap-3">
                    <Select value={mediaType} onValueChange={setMediaType}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Media Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Answers</Label>
                  {caasOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-md"
                    >
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateCaasOption(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <RadioGroup
                        value={option.isCorrect ? String(index) : ""}
                        onValueChange={() => setCaasCorrect(index)}
                      >
                        <RadioGroupItem
                          value={String(index)}
                          id={`caas-${index}`}
                        />
                      </RadioGroup>
                      {option.isCorrect && (
                        <Badge className="bg-blue-100 text-blue-700">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DISC */}
            {activeType === "DISC" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    placeholder="Saya merasa nyaman mengikuti aturan yang sudah ada"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Answers</Label>
                  {Object.entries(discOptions).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 border rounded-md"
                    >
                      <Input
                        placeholder={discPlaceholder[key as keyof typeof discPlaceholder]}
                        value={value}
                        onChange={(e) =>
                          setDiscOptions({
                            ...discOptions,
                            [key]: e.target.value,
                          })
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

            {/* Footer */}
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
