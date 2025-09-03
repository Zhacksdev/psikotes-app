"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type TitleBarProps = {
  onAdd?: () => void; // klik => buka dialog "New Question Bank"
};

export default function TitleBar({ onAdd }: TitleBarProps) {
  return (
    <div className="mb-6 mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <p className="text-sm text-muted-foreground">
          Organize and reuse your question collections efficiently
        </p>
      </div>

      <Button
        onClick={onAdd}
        size="lg"
        className="w-full md:w-auto"
        aria-label="Create new question bank"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Question Bank
      </Button>
    </div>
  );
}
