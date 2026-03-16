"use client";

import { Modal } from "./modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = "Confirm", variant = "danger", loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2 rounded-lg ${
          variant === "danger" ? "bg-red-500/20" : "bg-yellow-500/20"
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            variant === "danger" ? "text-red-400" : "text-yellow-400"
          }`} />
        </div>
        <p className="text-gray-300">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
        <button
          onClick={onConfirm}
          className={variant === "danger" ? "btn-danger" : "btn-primary"}
          disabled={loading}
        >
          {loading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
