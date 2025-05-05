"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";

type PaginationProps = {
  page: number;
  count: number;
  onPageChange: (newPage: number) => void;
};

const Pagination = ({ page, count, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  console.log("Pagination Props:", { page, count, totalPages, hasPrev, hasNext });

  const handlePageChange = (newPage: number) => {
    console.log("Pagination: Changing to page:", newPage, "current:", page);
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageChange(page - 1)}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageIndex = index + 1;
          return (
            <button
              key={pageIndex}
              className={`px-2 rounded-sm ${page === pageIndex ? "bg-lamaSky text-white" : ""}`}
              onClick={() => handlePageChange(pageIndex)}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>
      <button
        disabled={!hasNext}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;