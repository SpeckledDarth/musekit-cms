"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, pageSize = 25, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border",
            currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border",
            currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number = 25): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
