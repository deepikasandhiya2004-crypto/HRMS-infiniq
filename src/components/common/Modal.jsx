export default function Modal({ open, isOpen, onClose, title, children, size }) {
  const visible = open ?? isOpen;

  if (!visible) return null;

  const maxWidth =
    size === "lg" ? "max-w-4xl" :
    size === "sm" ? "max-w-sm" :
    "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="m-0 text-lg font-bold text-dark">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-dark/50 hover:text-dark"
          >
            X
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
