import React from 'react';

export default function QuickAssignModal({
  open,
  tenants,
  selectedTenant,
  onSelectTenant,
  onClose,
  onAssign,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-4">
        <h3 className="font-semibold mb-3">Quick Assign Tenant</h3>

        <div className="max-h-64 overflow-auto space-y-2">
          {tenants.length === 0 && (
            <div className="text-sm text-gray-500">
              No tenants found
            </div>
          )}

          {tenants.map(t => (
            <button
              key={t.id}
              onClick={() => onSelectTenant(t)}
              className={`w-full text-left px-3 py-2 rounded border ${
                selectedTenant?.id === t.id
                  ? 'bg-indigo-50 border-indigo-400'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">
                {t.mobileNumber}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            disabled={!selectedTenant}
            className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            onClick={onAssign}
            >
            Assign
            </button>
        </div>
        {/* {isAlreadyAssigned && (
            <div className="text-xs text-red-600 mt-2">
                Already assigned to {selectedTenant.activeBed.bedName}
            </div>
            )} */}
      </div>
    </div>
  )
}
