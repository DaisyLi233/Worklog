export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-cocoa-text/20 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-2xl border border-border-warm p-6 w-full max-w-sm shadow-lg">
        <p className="text-sm text-cocoa-text mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-4">Cancel</button>
          <button
            onClick={onConfirm}
            className="text-xs py-1.5 px-4 rounded-lg bg-tag-obstacle-text text-white hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
