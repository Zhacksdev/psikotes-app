"use client";

import React, { useEffect, useState } from "react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSave: (id: string, data: Omit<Question, "id">) => Promise<void> | void;
};

export default function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: Props) {
  const [type, setType] = useState<QuestionType>("DISC");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("-");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "">("");

  const [discOptions, setDiscOptions] = useState({ D: "", I: "", S: "", C: "" });
  const [caasOptions, setCaasOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [caasAnswer, setCaasAnswer] = useState("");
  const [fastAccOptions, setFastAccOptions] = useState({ True: "", False: "" });
  const [fastAccAnswer, setFastAccAnswer] = useState("");

  useEffect(() => {
    if (!question) return;

    setType(question.type);
    setText(question.text ?? "");
    setCategory(question.category ?? "-");
    setMediaUrl(question.mediaUrl ?? "");
    setMediaType(question.mediaType ?? "");

    if (question.type === "DISC") {
      const o = (question.options ?? {}) as Partial<typeof discOptions>;
      setDiscOptions({
        D: o.D ?? "",
        I: o.I ?? "",
        S: o.S ?? "",
        C: o.C ?? "",
      });
    } else if (question.type === "CAAS") {
      const o = (question.options ?? {}) as Partial<typeof caasOptions>;
      setCaasOptions({
        A: o.A ?? "",
        B: o.B ?? "",
        C: o.C ?? "",
        D: o.D ?? "",
      });
      setCaasAnswer((question.answer as string) ?? "");
    } else {
      const o = (question.options ?? {}) as Partial<typeof fastAccOptions>;
      setFastAccOptions({
        True: o.True ?? "",
        False: o.False ?? "",
      });
      setFastAccAnswer((question.answer as string) ?? "");
    }
  }, [question, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;

    const payload: Omit<Question, "id"> = {
      type,
      text,
      category: category || "-",
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      options: undefined,
      answer: undefined,
    };

    if (type === "DISC") {
      payload.options = discOptions;
    } else if (type === "CAAS") {
      payload.options = caasOptions;
      payload.answer = caasAnswer || undefined;
    } else if (type === "Fast Accuracy") {
      payload.options = fastAccOptions;
      payload.answer = fastAccAnswer || undefined;
    }

    await onSave(question.id, payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[100vh]">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-base sm:text-lg">Edit Question</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Perbarui isi pertanyaan tipe <b>{question?.type ?? type}</b>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-6 pt-2 space-y-4">
              {/* Tipe & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium">Tipe Tes</label>
                  <Input value={type} readOnly className="text-sm bg-muted/50" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium">Kategori</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Kategori"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Pertanyaan */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">Pertanyaan</label>
                <Textarea
                  placeholder="Masukkan pertanyaan"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
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
              {type === "DISC" && (
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-medium">Opsi DISC</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["D", "I", "S", "C"] as const).map((k) => (
                      <Input
                        key={k}
                        placeholder={k}
                        value={discOptions[k]}
                        onChange={(e) =>
                          setDiscOptions({ ...discOptions, [k]: e.target.value })
                        }
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {type === "CAAS" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-medium">Opsi CAAS</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["A", "B", "C", "D"] as const).map((k) => (
                        <Input
                          key={k}
                          placeholder={k}
                          value={caasOptions[k]}
                          onChange={(e) =>
                            setCaasOptions({ ...caasOptions, [k]: e.target.value })
                          }
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
                        {(["A", "B", "C", "D"] as const).map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {type === "Fast Accuracy" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-medium">Opsi Fast Accuracy</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["True", "False"] as const).map((k) => (
                        <Input
                          key={k}
                          placeholder={k}
                          value={fastAccOptions[k]}
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
                        {(["True", "False"] as const).map((k) => (
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
                <Button type="submit" className="min-w-[96px]" disabled={!question}>
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
