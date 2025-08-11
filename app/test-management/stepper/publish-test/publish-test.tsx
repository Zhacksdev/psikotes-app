"use client";

/**
 * PublishTestPage
 * -----------------------------------------------------------------------------
 * Tujuan:
 * - Mengatur urutan (drag & drop) modul tes
 * - Menentukan jadwal akses (start / end)
 * - Publish tes ke kandidat
 *
 * Catatan Maintenance (IMPORTANT):
 * 1) Sumber Data Kandidat:
 *    - Komponen ini menerima `candidates` dari parent. Jika parent tidak mengirim
 *      (atau kosong), komponen akan Fallback Hydration dari localStorage via
 *      `getCandidatesAPI()` saat mount.
 *    - Lebih baik lagi: jadikan `candidates` state global (Context/Zustand) atau
 *      disatukan di parent wizard supaya 1 sumber kebenaran.
 *
 * 2) Refactor Disarankan:
 *    - Ekstrak state dan aksi ke hook `usePublishTest()` (tests order, publish,
 *      jadwal, drag handlers).
 *    - Ketika sudah ada backend, pindahkan publish ke SERVICE:
 *      `publishTestAPI(payload)` lalu konsumsi via hook.
 *
 * 3) DnD (dnd-kit):
 *    - Tambahkan `activationConstraint` pada `PointerSensor` untuk cegah drag
 *      tak sengaja (lihat komentar sensors).
 *
 * 4) UI Consistency:
 *    - Header mengikuti pola Manage Candidates (ikon test, target position,
 *      jumlah kandidat).
 *
 * 5) Revisi sesuai permintaan:
 *    - HAPUS menu Edit/Delete pada kartu test.
 *    - Jadikan Questions & Duration sebagai badge (pill).
 */

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

import {
  Users,
  Clock,
  NotebookText,
  BriefcaseBusiness,
  GripVertical,
} from "lucide-react";
import { ICON_MAP } from "@/lib/icon-mapping";
import type { Candidate } from "../manage-candidates/service/manage-candidates-service";
import { getCandidatesAPI } from "../manage-candidates/service/manage-candidates-service";

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
  candidates: Candidate[]; // <- dari parent; bisa kosong
  onPublishSuccess: () => void;
  onBack: () => void;
};

/* =============================================================================
 * SortableCard
 * - Kartu test dengan handle drag kiri.
 * - (Revisi) HAPUS menu edit/delete.
 * - Questions & Duration → badge.
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
      {/* Drag handle kiri */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
      </div>

      <div className="flex-1">
        <h1 className={cn("font-semibold", test.textColor)}>{test.title}</h1>

        {/* Badge info test */}
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
 * DateTimePicker24h
 * - Perbaikan: jangan mutate array (hindari .reverse() langsung); pakai salinan.
 * ============================================================================= */
export function DateTimePicker24h() {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const hoursDesc = useMemo(() => [...hours].reverse(), [hours]); // salinan terbalik

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (!date) return;
    const d = new Date(date);
    if (type === "hour") d.setHours(parseInt(value));
    else d.setMinutes(parseInt(value));
    setDate(d);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy HH:mm") : <span>MM/DD/YYYY HH:mm</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hoursDesc.map((h) => (
                  <Button
                    key={h}
                    size="icon"
                    variant={date?.getHours() === h ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", h.toString())}
                  >
                    {h}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            {/* Minutes (step 5) */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <Button
                    key={m}
                    size="icon"
                    variant={date?.getMinutes() === m ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", String(m))}
                  >
                    {m.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* =============================================================================
 * Page
 * ============================================================================= */
export default function PublishTestPage({
  testName,
  testIcon,
  targetPosition,
  candidates,
  onPublishSuccess,
  onBack,
}: PublishTestPageProps) {
  // NOTE: direkomendasikan pindahkan default tests ini ke hook/usePublishTest()
  const [tests, setTests] = useState<TestItem[]>([
    {
      key: "DISC",
      title: "DISC Assessment",
      questions: 30,
      duration: 25,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      key: "CAAS",
      title: "CAAS Evaluation",
      questions: 15,
      duration: 20,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
    },
    {
      key: "FAST",
      title: "Cepat Teliti",
      questions: 15,
      duration: 20,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  /** Kandidat Count (HYDRATE kalau props kosong)
   * - Sumber utama: props.candidates
   * - Fallback: getCandidatesAPI() dari localStorage
   * - Saran: di wizard multi-step, pegang ini di parent atau store global
   */
  const [candList, setCandList] = useState<Candidate[]>(candidates ?? []);
  useEffect(() => {
    if (!candidates || candidates.length === 0) {
      getCandidatesAPI().then((res) => setCandList(res));
    } else {
      setCandList(candidates);
    }
  }, [candidates]);

  // SENSORS:
  // Saran: tambahkan activationConstraint agar drag tidak aktif pada klik kecil
  // const sensors = useSensors(
  //   useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  // );
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const i0 = tests.findIndex((t) => t.key === active.id);
      const i1 = tests.findIndex((t) => t.key === over.id);
      setTests((arr) => arrayMove(arr, i0, i1));
    }
  };

  // NOTE: ketika sudah punya API, pindahkan ke service `publishTestAPI(payload)`
  async function handlePublish() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onPublishSuccess();
    }, 1200);
  }

  return (
    <div className="w-full px-2 sm:px-6 md:px-8 lg:px-16 py-8 space-y-8">
      {/* HEADER (disamakan pola dengan Manage Candidates) */}
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
              <span className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4" />
                {candList.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TEST CONFIGURATION */}
      <h3 className="font-semibold text-lg">Test Configuration</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tests.map((t) => t.key)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {tests.map((t) => (
              <SortableCard key={t.key} test={t} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ACCESS SCHEDULE */}
      <h3 className="font-semibold text-lg">Access Schedule</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div>
          <Label className="block mb-3 text-sm font-semibold">Test Access Starts</Label>
          <DateTimePicker24h />
        </div>
        <div>
          <Label className="block mb-3 text-sm font-semibold">Test Access Ends</Label>
          <DateTimePicker24h />
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-end gap-3 pt-8">
        <Button variant="outline" onClick={onBack} className="min-w-[90px] px-6 py-2">
          Back
        </Button>
        <Button onClick={handlePublish} disabled={isLoading} className="min-w-[90px] px-6 py-2">
          {isLoading ? "Publishing..." : "Publish Test"}
        </Button>
      </div>
    </div>
  );
}
