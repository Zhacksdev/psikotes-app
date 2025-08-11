// app/candidates/page.tsx
"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import { TitleBar } from "./components/title-bar";
import TableSkeleton from "./components/table-skeleton";
import { CandidateTable } from "./components/candidates-table";
import { useCandidates } from "./hooks/use-candidates";

export default function CandidatesPage() {
  const { candidates, loading, error } = useCandidates();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <Topbar />

        <main className="flex-1 px-8 pt-2 pb-8">
          <TitleBar />

          {/* Loading skeleton */}
          {loading && <TableSkeleton />}

          {/* Error message */}
          {error && <div className="text-red-500 mt-4">{error}</div>}

          {/* Actual table */}
          {!loading && !error && <CandidateTable candidates={candidates} />}
        </main>
      </div>
    </div>
  );
}
