// components/ResultDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ResultDetail } from "../services/result-service";

export interface ResultDialogProps {
  open: boolean;
  detail?: ResultDetail;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf: () => void;
}

export function ResultDialog({ open, detail, onOpenChange, onDownloadPdf }: ResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Test Results: {detail?.candidateName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {detail?.scores.map(score => (
            <div key={score.testName} className="flex justify-between">
              <div>
                <div className="font-medium">{score.testName}</div>
                <div className="text-xs text-gray-500">{score.date}</div>
              </div>
              <div className="font-semibold">{score.score}</div>
            </div>
          ))}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={onDownloadPdf}>Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
