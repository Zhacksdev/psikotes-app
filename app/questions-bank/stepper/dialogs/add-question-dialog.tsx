"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Question,
  QuestionType,
  MediaType,
} from "../services/add-question-bank-service";

type AddQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: QuestionType;
  onSave: (data: Omit<Question, "id">) => Promise<void> | void;
};

export default function AddQuestionDialog({
  open,
  onOpenChange,
  activeType,
  onSave,
}: AddQuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "">("");
  const [category, setCategory] = useState("");

  const [discOptions, setDiscOptions] = useState({ D: "", I: "", S: "", C: "" });
  const [caasOptions, setCaasOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [caasAnswer, setCaasAnswer] = useState("");
  const [fastAccOptions, setFastAccOptions] = useState({ True: "", False: "" });
  const [fastAccAnswer, setFastAccAnswer] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: Omit<Question, "id"> = {
      type: activeType,
      text: questionText,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      category: category || "-",
      options: undefined,
      answer: undefined,
    };

    if (activeType === "DISC") {
      payload.options = discOptions;
    } else if (activeType === "CAAS") {
      payload.options = caasOptions;
      payload.answer = caasAnswer;
    } else if (activeType === "Fast Accuracy") {
      payload.options = fastAccOptions;
      payload.answer = fastAccAnswer;
    }

    await onSave(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[100vh]">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-base sm:text-lg">Add New Question</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi pertanyaan sesuai tipe <b>{activeType}</b>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <form onSubmit={handleSave} className="px-4 sm:px-6 pb-6 pt-2 space-y-4">
              {/* Pertanyaan */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">Pertanyaan</label>
                <Textarea
                  placeholder="Masukkan pertanyaan"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">Kategori</label>
                <Input
                  placeholder="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium">Media URL</label>
                  <Input
                    placeholder="https://..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium">Media Type</label>
                  <Select value={mediaType} onValueChange={(v: MediaType) => setMediaType(v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Pilih media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Opsi per tipe */}
              {activeType === "DISC" && (
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-medium">Opsi DISC</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(discOptions).map((k) => (
                      <Input
                        key={k}
                        placeholder={k}
                        value={discOptions[k as keyof typeof discOptions]}
                        onChange={(e) => setDiscOptions({ ...discOptions, [k]: e.target.value })}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeType === "CAAS" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-medium">Opsi CAAS</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(caasOptions).map((k) => (
                        <Input
                          key={k}
                          placeholder={k}
                          value={caasOptions[k as keyof typeof caasOptions]}
                          onChange={(e) => setCaasOptions({ ...caasOptions, [k]: e.target.value })}
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium">Jawaban benar</label>
                    <Select value={caasAnswer} onValueChange={setCaasAnswer}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Pilih jawaban benar" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(caasOptions).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeType === "Fast Accuracy" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-medium">Opsi Fast Accuracy</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(fastAccOptions).map((k) => (
                        <Input
                          key={k}
                          placeholder={k}
                          value={fastAccOptions[k as keyof typeof fastAccOptions]}
                          onChange={(e) =>
                            setFastAccOptions({ ...fastAccOptions, [k]: e.target.value })
                          }
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium">Jawaban benar</label>
                    <Select value={fastAccAnswer} onValueChange={setFastAccAnswer}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Pilih jawaban benar" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(fastAccOptions).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="min-w-[96px]"
                >
                  Cancel
                </Button>
                <Button type="submit" className="min-w-[96px]">
                  Save
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
