import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DialogType = "alert" | "confirm" | "error" | "success";

interface DialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancelar",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === 'confirm' ? onCancel : onConfirm}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xs overflow-hidden rounded-2xl border-2 border-gray-300 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
          >
            <div className="p-6 flex flex-col gap-4 text-center">
              {/* Icon based on type */}
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl mb-1 ${
                type === "error" ? "bg-red-100 border-red-200" :
                type === "success" ? "bg-emerald-100 border-emerald-200" :
                type === "alert" ? "bg-blue-100 border-blue-200" :
                "bg-gray-100 border-gray-200"
              }`}>
                {type === "error" && "🚨"}
                {type === "success" && "✅"}
                {type === "alert" && "ℹ️"}
                {type === "confirm" && "🤔"}
              </div>

              <h3 id="dialog-title" className="text-lg font-bold text-gray-900">{title}</h3>
              <p id="dialog-message" className="text-sm text-gray-800 leading-relaxed font-medium">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t-2 border-gray-200 bg-gray-50">
              {type === "confirm" ? (
                <>
                  <button
                    onClick={onCancel}
                    className="flex-1 py-4 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-inset"
                    aria-label={cancelText}
                  >
                    {cancelText}
                  </button>
                  <div className="w-px bg-gray-300" />
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-4 text-sm font-bold text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    aria-label={confirmText}
                  >
                    {confirmText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onConfirm}
                  className="flex-1 py-4 text-sm font-bold text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-label={confirmText}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
