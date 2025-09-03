"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Upload, Search as SearchIcon, Filter as FilterIcon, X } from "lucide-react";

export type DialogQuestion = {
  id: string;
  text: string;
  tags: string[];
};

type ImportQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionBank: DialogQuestion[];
  onImport: (selected: Omit<DialogQuestion, "id">[]) => Promise<void>;
  onUploadCSV: (file: File) => Promise<void>;
  uploading?: boolean;
  error?: string | null;
};

export default function ImportQuestionDialog({
  open,
  onOpenChange,
  questionBank,
  onImport,
  onUploadCSV,
  uploading,
  error,
}: ImportQuestionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    questionBank.forEach((q) => q.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [questionBank]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questionBank.filter((item) => {
      const matchesSearch = !q || item.text.toLowerCase().includes(q);
      const matchesTags =
        selectedTags.length === 0 ||
        item.tags?.some((t) => selectedTags.includes(t));
      return matchesSearch && matchesTags;
    });
  }, [questionBank, search, selectedTags]);

  const toggleCheck = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleSelectAll = () => setSelectedIds(filtered.map((x) => x.id));

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((t) => t !== tag)));
  };

  const chooseFile = () => inputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.currentTarget.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(false);
  };

  const handleImportSelected = async () => {
    const payload = questionBank
      .filter((q) => selectedIds.includes(q.id))
      .map(({ ...rest }) => rest);
    await onImport(payload);
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleUploadCSV = async () => {
    if (!file) return;
    await onUploadCSV(file);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* PENTING: max-h + overflow-hidden, body di bawah yang scroll */}
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[100vh] ">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-base sm:text-lg mb-4">Import Question</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="bank" className="flex h-full flex-col">
            {/* Tabs header (non-scroll) */}
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="bank" className="text-xs sm:text-sm">
                  Question Bank
                </TabsTrigger>
                <TabsTrigger value="csv" className="text-xs sm:text-sm">
                  CSV Upload
                </TabsTrigger>
              </TabsList>
            </div>

            {/* BODY SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* ================= From Question Bank ================= */}
              <TabsContent value="bank" className="mt-0 space-y-4">
                {/* Search + Filter Controls */}
                <div className="space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>

                  {/* Filter Tags & Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Active Filters */}
                    {selectedTags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {tag}
                            <button
                              onClick={() => toggleTag(tag, false)}
                              className="hover:bg-blue-100 rounded-full p-0.5"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                        {selectedTags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{selectedTags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Filter Button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2.5">
                            <FilterIcon className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:ml-1.5 text-xs">
                              Filter
                            </span>
                            {selectedTags.length > 0 && (
                              <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                                {selectedTags.length}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="end" sideOffset={4}>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Filter by tags</span>
                              {selectedTags.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTags([])}
                                  className="h-6 px-2 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                            <Separator />
                            {/* Batasi tinggi daftar tag pakai ScrollArea */}
                            <ScrollArea className="max-h-48">
                              <div className="space-y-1">
                                {allTags.map((tag) => {
                                  const checked = selectedTags.includes(tag);
                                  return (
                                    <label
                                      key={tag}
                                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(v) => toggleTag(tag, Boolean(v))}
                                      />
                                      <span className="flex-1 truncate">{tag}</span>
                                    </label>
                                  );
                                })}
                                {allTags.length === 0 && (
                                  <div className="py-4 text-center text-sm text-muted-foreground">
                                    No tags available
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Select All / Clear Button */}
                      {selectedIds.length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIds([])}
                          className="h-8 px-2.5 text-xs"
                        >
                          Clear All
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="h-8 px-2.5 text-xs"
                          disabled={filtered.length === 0}
                        >
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Questions List — biarkan body yang scroll (hindari nested scroll) */}
                <div className="space-y-2">
                  {filtered.map((q, index) => {
                    const checked = selectedIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                          checked ? "bg-blue-50 border-blue-200" : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px]">
                              {index + 1}
                            </span>
                            <span>Question</span>
                          </div>
                          <div className="text-sm font-medium leading-relaxed">{q.text}</div>
                          {q.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {q.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleCheck(q.id, Boolean(v))}
                          className="mt-1 shrink-0"
                        />
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-sm text-muted-foreground">No questions match your criteria</div>
                      <div className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    {selectedIds.length} of {filtered.length} selected
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleImportSelected} disabled={selectedIds.length === 0}>
                      Import ({selectedIds.length})
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ================= From CSV Upload ================= */}
              <TabsContent value="csv" className="mt-0 space-y-4">
                {error && (
                  <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md border border-red-100">
                    {error}
                  </div>
                )}

                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`rounded-xl border-2 border-dashed p-8 text-center ${
                    isDropping ? "border-primary/60 bg-muted/50" : "border-muted-foreground/20"
                  }`}
                >
                  <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <div className="text-base font-medium">Upload CSV/XLS File</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Drag & drop file di sini, atau klik tombol di bawah.
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <Button onClick={chooseFile} className="mt-4">
                    Choose File
                  </Button>

                  {file && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Selected: <span className="font-medium text-foreground">{file.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!uploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadCSV} disabled={!file || !!uploading}>
                    {uploading ? "Uploading..." : "Upload & Import"}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
