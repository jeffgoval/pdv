"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Dialog, DialogType } from "@/components/ui/Dialog";

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
}

interface DialogContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showError: (message: string, title?: string) => Promise<void>;
  showSuccess: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: DialogOptions;
    resolve: (value: any) => void;
  }>({
    isOpen: false,
    options: { title: "", message: "", type: "alert" },
    resolve: () => {},
  });

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showDialog = useCallback(
    (options: DialogOptions): Promise<any> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          options,
          resolve,
        });
      });
    },
    []
  );

  const showAlert = useCallback(
    async (message: string, title: string = "Aviso") => {
      await showDialog({ title, message, type: "alert", confirmText: "OK" });
    },
    [showDialog]
  );

  const showError = useCallback(
    async (message: string, title: string = "Erro") => {
      await showDialog({ title, message, type: "error", confirmText: "Entendi" });
    },
    [showDialog]
  );

  const showSuccess = useCallback(
    async (message: string, title: string = "Sucesso") => {
      await showDialog({ title, message, type: "success", confirmText: "OK" });
    },
    [showDialog]
  );

  const showConfirm = useCallback(
    async (message: string, title: string = "Confirmação") => {
      const result = await showDialog({
        title,
        message,
        type: "confirm",
        confirmText: "Sim",
        cancelText: "Não",
      });
      return result === true;
    },
    [showDialog]
  );

  const handleConfirm = () => {
    dialogState.resolve(true);
    closeDialog();
  };

  const handleCancel = () => {
    dialogState.resolve(false);
    closeDialog();
  };

  return (
    <DialogContext.Provider
      value={{ showAlert, showError, showSuccess, showConfirm }}
    >
      {children}
      <Dialog
        isOpen={dialogState.isOpen}
        type={dialogState.options.type || "alert"}
        title={dialogState.options.title}
        message={dialogState.options.message}
        confirmText={dialogState.options.confirmText}
        cancelText={dialogState.options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
