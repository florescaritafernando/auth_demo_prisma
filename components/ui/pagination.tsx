"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (value: number) => void
  itemLabel?: string
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = "elementos"
}: PaginationProps) {
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const showPaginationControls = totalPages > 5

  return (
    <div className="mt-4">
      {showPaginationControls && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-slate-300 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  currentPage === page
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                } border border-slate-300`}
              >
                {page}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-slate-300 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-700">
          Mostrando {startItem} - {endItem} de {totalItems} {itemLabel}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>
    </div>
  )
}