import React from "react";
import "./ConfirmModal.css";

function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>
            Sí, eliminar
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
