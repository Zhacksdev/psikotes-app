// components/TestTable.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Briefcase,
  UserCheck,
  GraduationCap,
  Heart,
  Users,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { useTests } from "../hooks/use-tests";
import TableSkeleton from "./table-skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Managerial: <Briefcase size={20} className="text-blue-400" />,
  "All Candidates": <UserCheck size={20} className="text-green-400" />,
  "Fresh Graduates": <GraduationCap size={20} className="text-yellow-400" />,
  "HR Staff": <Heart size={20} className="text-red-400" />,
};

const TYPE_STYLE: Record<string, string> = {
  DISC: "bg-blue-100 text-blue-700",
  CAAS: "bg-yellow-100 text-yellow-800",
  "Fast Accuracy": "bg-green-100 text-green-700",
};

const STATUS_STYLE: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Ongoing: "bg-yellow-100 text-yellow-800",
  Draft: "bg-gray-100 text-gray-500",
  Expired: "bg-red-100 text-red-500",
};

export default function TestTable() {
  const { tests, loading, error } = useTests();

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {[
                "Test Name",
                "Type",
                "Questions",
                "Duration",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 pb-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.map((test, i) => (
              <tr key={test.id ?? i} className="bg-white">
                {/* Test Name */}
                <td className="px-6 py-4 flex items-center gap-3 align-middle">
                  {/* Icon bulat */}
                  <span className="w-15 h-15 flex items-center justify-center rounded-full bg-white shadow">
                    {CATEGORY_ICON[test.category] ?? (
                      <Briefcase size={25} className="text-gray-400" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 truncate">
                      {test.name}
                    </div>
                    <div className="text-xs text-gray-500">{test.category}</div>
                  </div>
                </td>
                {/* Type */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex gap-2 flex-wrap">
                    {test.types.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                          TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                        )}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </td>
                {/* Questions */}
                <td className="px-6 py-4 text-[15px] text-gray-900 font-medium align-middle">
                  {test.questions}
                </td>
                {/* Duration */}
                <td className="px-6 py-4 text-[15px] text-gray-900 font-medium align-middle">
                  {test.duration}
                </td>
                {/* Status */}
                <td className="px-6 py-4 align-middle">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      STATUS_STYLE[test.status] || "bg-gray-100 text-gray-500"
                    )}
                  >
                    {test.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 px-2 py-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[160px] rounded-xl py-2 px-1 shadow-lg border border-gray-100"
                    >
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" /> Candidates
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Test
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-lg shadow-sm p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                  {CATEGORY_ICON[test.category] || (
                    <Briefcase size={20} className="text-gray-400" />
                  )}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 truncate">
                    {test.name}
                  </div>
                  <div className="text-xs text-gray-500">{test.category}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[120px] rounded-lg"
                >
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" /> Questions
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" /> Candidates
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Edit Test
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Started Date</span>
                <span className="text-gray-900 font-medium">
                  {test.startedDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Type</span>
                <div className="flex gap-2">
                  {test.types.map((type) => (
                    <span
                      key={type}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                      )}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Questions</span>
                <span className="text-gray-900 font-medium">
                  {test.questions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-900 font-medium">
                  {test.duration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    STATUS_STYLE[test.status] || "bg-gray-100 text-gray-500"
                  )}
                >
                  {test.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
