'use client'

import { Button } from '@/components/ui/button'

interface BulkActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onUnselectAll: () => void
  onDownloadZip: () => void
  onDeleteSelected: () => void
  isProcessing?: boolean
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onUnselectAll,
  onDownloadZip,
  onDeleteSelected,
  isProcessing = false,
}: BulkActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Selection Info */}
        <div>
          <h3 className="font-bold text-gray-900">Bulk Actions</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedCount > 0 ? (
              <>
                <span className="font-semibold text-primary-600">{selectedCount}</span> of{' '}
                {totalCount} photos selected
              </>
            ) : (
              <>No photos selected</>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Select/Unselect All */}
          {selectedCount < totalCount ? (
            <Button
              onClick={onSelectAll}
              disabled={isProcessing}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              ✓ Select All ({totalCount})
            </Button>
          ) : (
            <Button
              onClick={onUnselectAll}
              disabled={isProcessing}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              ✗ Unselect All
            </Button>
          )}

          {/* Download as ZIP */}
          <Button
            onClick={onDownloadZip}
            disabled={selectedCount === 0 || isProcessing}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            📦 Download ZIP ({selectedCount})
          </Button>

          {/* Delete Selected */}
          <Button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || isProcessing}
            className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🗑️ Delete ({selectedCount})
          </Button>
        </div>
      </div>

      {/* Warning Message */}
      {selectedCount > 500 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Warning:</strong> You have selected {selectedCount} photos. Bulk operations on
            large selections may take several minutes to complete.
          </p>
        </div>
      )}
    </div>
  )
}
