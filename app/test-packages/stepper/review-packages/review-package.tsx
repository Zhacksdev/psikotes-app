"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Clock, NotebookText, BriefcaseBusiness, GripVertical } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-mapping";

/* =============================================================================
 * Types
 * ============================================================================= */
type TestItem = {
  key: string;
  title: string;
  questions: number;
  duration: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

type PublishTestPageProps = {
  testName: string;
  testIcon: keyof typeof ICON_MAP;
  targetPosition: string;
  allowedTypes?: string[]; // bisa dari props / localStorage
  onPublishSuccess: () => void;
  onBack: () => void;
};

/* =============================================================================
 * Mapping tipe → kartu (styling only)
 * ============================================================================= */
const TEST_ITEM_MAP: Record<string, Omit<TestItem, "questions" | "duration">> = {
  DISC: {
    key: "DISC",
    title: "DISC Assessment",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  CAAS: {
    key: "CAAS",
    title: "CAAS Evaluation",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
  },
  "Fast Accuracy": {
    key: "Fast Accuracy",
    title: "Fast Accuracy",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
};

/* =============================================================================
 * SortableCard
 * ============================================================================= */
function SortableCard({ test }: { test: TestItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: test.key });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col sm:flex-row pl-12 pr-5 py-4 gap-4 border-2 rounded-xl shadow-sm",
        test.borderColor,
        test.bgColor
      )}
    >
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
      </div>

      <div className="flex-1">
        <h1 className={cn("font-semibold", test.textColor)}>{test.title}</h1>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1">
            <NotebookText className="w-4 h-4" />
            <span>{test.questions} Questions</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1">
            <Clock className="w-4 h-4" />
            <span>{test.duration} min</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

/* =============================================================================
 * Page
 * ============================================================================= */
export default function PublishTestPage({
  testName,
  testIcon,
  targetPosition,
  allowedTypes,
  onPublishSuccess,
  onBack,
}: PublishTestPageProps) {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil allowedTypes & testConfigs dari localStorage
  useEffect(() => {
    let finalAllowed: string[] = [];
    if (allowedTypes && allowedTypes.length > 0) {
      finalAllowed = allowedTypes;
    } else {
      try {
        const stored = localStorage.getItem("allowedTypes");
        finalAllowed = stored ? JSON.parse(stored) : [];
      } catch (err) {
        console.error("Failed to parse allowedTypes from localStorage", err);
      }
    }

    // 🔑 Ambil konfigurasi hasil step 2
    let savedConfigs: Record<string, { questions: number; duration: number }> = {};
    try {
      const storedConfigs = localStorage.getItem("testConfigs");
      savedConfigs = storedConfigs ? JSON.parse(storedConfigs) : {};
    } catch (err) {
      console.error("Failed to parse testConfigs", err);
    }

    // Merge styling + config dari step 2
    const mapped = finalAllowed
      .map((t) => {
        const base = TEST_ITEM_MAP[t];
        if (!base) return null;
        return {
          ...base,
          questions: savedConfigs[t]?.questions ?? 0,
          duration: savedConfigs[t]?.duration ?? 0,
        };
      })
      .filter(Boolean);

    setTests(mapped as TestItem[]);
  }, [allowedTypes]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const i0 = tests.findIndex((t) => t.key === active.id);
      const i1 = tests.findIndex((t) => t.key === over.id);
      setTests((arr) => arrayMove(arr, i0, i1));
    }
  };

  async function handlePublish() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onPublishSuccess();
    }, 1200);
  }

  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-2 border-blue-200 bg-white text-blue-500 text-3xl">
            {ICON_MAP[testIcon]}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{testName}</h2>
            <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs sm:text-sm flex-wrap">
              <span className="flex items-center gap-2 truncate">
                <BriefcaseBusiness className="w-4 h-4 sm:w-4 sm:h-4" />
                {targetPosition}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TEST CONFIGURATION */}
      <h3 className="font-semibold text-lg">Test Configuration</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tests.map((t) => t.key)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {tests.length > 0 ? (
              tests.map((t) => <SortableCard key={t.key} test={t} />)
            ) : (
              <p className="text-sm text-gray-500">No test type selected.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* NAVIGATION */}
      <div className="flex justify-end gap-3 pt-8">
        <Button variant="outline" onClick={onBack} className="min-w-[90px] px-6 py-2">
          Back
        </Button>
        <Button onClick={handlePublish} disabled={isLoading} className="min-w-[90px] px-6 py-2">
          {isLoading ? "Saving..." : "Save Packages"}
        </Button>
      </div>
    </div>
  );
}
