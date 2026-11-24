'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  Trash2,
  HelpCircle,
  X,
} from 'lucide-react';

export type DialogType = 'danger' | 'warning' | 'info' | 'primary' | 'success';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: 'logout' | 'delete' | 'warning' | 'info' | 'question';
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'warning' | 'error' | 'info' | 'success';
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Confirm state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { message: '' },
    resolve: null,
  });

  // Alert state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: (() => void) | null;
  }>({
    isOpen: false,
    options: { message: '' },
    resolve: null,
  });

  // Toasts state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Confirm method
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Alert method
  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      const opts: AlertOptions =
        typeof options === 'string'
          ? {
              title: 'แจ้งเตือน',
              message: options,
              type: 'warning',
              buttonText: 'ตกลง',
            }
          : {
              title: options.title || 'แจ้งเตือน',
              message: options.message,
              type: options.type || 'warning',
              buttonText: options.buttonText || 'ตกลง',
            };

      setAlertState({
        isOpen: true,
        options: opts,
        resolve,
      });
    });
  }, []);

  const handleAlertClose = () => {
    if (alertState.resolve) {
      alertState.resolve();
    }
    setAlertState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Toast helpers
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = toastTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutsRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);

      toastTimeoutsRef.current.set(id, timeout);
    },
    [removeToast]
  );

  const toast = {
    success: (msg: string, duration?: number) => addToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => addToast(msg, 'error', duration),
    warning: (msg: string, duration?: number) => addToast(msg, 'warning', duration),
    info: (msg: string, duration?: number) => addToast(msg, 'info', duration),
  };

  // Icon selector for Confirm
  const renderConfirmIcon = () => {
    const { type = 'warning', icon } = confirmState.options;

    if (icon === 'logout') {
      return (
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-500/15">
          <LogOut className="w-7 h-7" />
        </div>
      );
    }

    if (icon === 'delete' || type === 'danger') {
      return (
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-500/15">
          <Trash2 className="w-7 h-7" />
        </div>
      );
    }

    if (type === 'warning') {
      return (
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/15">
          <AlertTriangle className="w-7 h-7" />
        </div>
      );
    }

    if (type === 'info') {
      return (
        <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto mb-4 shadow-lg shadow-sky-500/15">
          <Info className="w-7 h-7" />
        </div>
      );
    }

    return (
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/15">
        <HelpCircle className="w-7 h-7" />
      </div>
    );
  };

  // Icon selector for Alert
  const renderAlertIcon = () => {
    const { type = 'warning' } = alertState.options;

    switch (type) {
      case 'error':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-500/15">
            <AlertCircle className="w-7 h-7" />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/15">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        );
      case 'info':
        return (
          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto mb-4 shadow-lg shadow-sky-500/15">
            <Info className="w-7 h-7" />
          </div>
        );
      case 'warning':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/15">
            <AlertTriangle className="w-7 h-7" />
          </div>
        );
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, toast }}>
      {children}

      {/* ========================================================= */}
      {/* 1. CONFIRMATION MODAL                                     */}
      {/* ========================================================= */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden">
            {/* Background Glow */}
            <div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
                confirmState.options.type === 'danger'
                  ? 'bg-rose-500/20'
                  : 'bg-amber-500/20'
              }`}
            />
            <div
              className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
                confirmState.options.type === 'danger'
                  ? 'bg-red-500/15'
                  : 'bg-yellow-500/15'
              }`}
            />

            {/* Icon */}
            {renderConfirmIcon()}

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
              {confirmState.options.title || 'ยืนยันการทำรายการ'}
            </h3>

            {/* Message */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {confirmState.options.message}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition cursor-pointer"
              >
                {confirmState.options.cancelText || 'ยกเลิก'}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer ${
                  confirmState.options.type === 'danger'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {confirmState.options.confirmText || 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ALERT MODAL                                            */}
      {/* ========================================================= */}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden">
            {/* Background Glow */}
            <div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
                alertState.options.type === 'error'
                  ? 'bg-rose-500/20'
                  : alertState.options.type === 'success'
                  ? 'bg-emerald-500/20'
                  : 'bg-amber-500/20'
              }`}
            />

            {/* Icon */}
            {renderAlertIcon()}

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
              {alertState.options.title || 'แจ้งเตือน'}
            </h3>

            {/* Message */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {alertState.options.message}
            </p>

            {/* Button */}
            <button
              type="button"
              onClick={handleAlertClose}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer ${
                alertState.options.type === 'error'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25'
                  : alertState.options.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25'
              }`}
            >
              {alertState.options.buttonText || 'ตกลง'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TOAST NOTIFICATIONS CONTAINER                          */}
      {/* ========================================================= */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[130] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let styleClasses = 'bg-slate-900/95 border-amber-500/40 text-amber-300';
          let IconComponent = AlertCircle;

          if (t.type === 'success') {
            styleClasses = 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10';
            IconComponent = CheckCircle2;
          } else if (t.type === 'error') {
            styleClasses = 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10';
            IconComponent = AlertCircle;
          } else if (t.type === 'info') {
            styleClasses = 'bg-slate-900/95 border-sky-500/40 text-sky-300 shadow-sky-500/10';
            IconComponent = Info;
          } else if (t.type === 'warning') {
            styleClasses = 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-500/10';
            IconComponent = AlertTriangle;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl border transition-all transform animate-in slide-in-from-top-2 duration-200 ${styleClasses}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent className="w-5 h-5 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                  {t.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/60 transition shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
