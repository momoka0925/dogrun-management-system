// components/ui.tsx
// ─────────────────────────────────────────────────────────────
// 画面全体で使い回す小さなUIパーツをまとめたファイル
// Button / Badge / Spinner / EmptyState / ErrorAlert
// ─────────────────────────────────────────────────────────────

import React from "react";

// ── ① ボタン ─────────────────────────────────────────────────
type ButtonProps = {
  children:  React.ReactNode;
  onClick?:  () => void;
  variant?:  "primary" | "danger" | "secondary"; // 見た目の種類
  disabled?: boolean;
  type?:     "button" | "submit";
  fullWidth?: boolean;
};

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  fullWidth = false,
}: ButtonProps) {
  // variant ごとに Tailwind クラスを切り替える
  const variantClass = {
    primary:
      "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-2 border-green-800 shadow-lg",
    danger:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border border-red-700 shadow-sm",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg text-sm font-extrabold
        transition duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {children}
    </button>
  );
}

// ── ② ステータスバッジ ────────────────────────────────────────
type BadgeProps = {
  status: string; // "active" | "inactive"
};

export function StatusBadge({ status }: BadgeProps) {
  const isActive = status === "active";
  return (
    <span
      className={`
        inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${isActive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-500"}
      `}
    >
      {isActive ? "有効" : "無効"}
    </span>
  );
}

// ── ③ ローディングスピナー ────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      読み込み中...
    </div>
  );
}

// ── ④ データ0件のときの空状態UI ───────────────────────────────
type EmptyStateProps = {
  message?: string;
};

export function EmptyState({ message = "データがありません" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      <span className="text-5xl">🐾</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── ⑤ エラーアラート ─────────────────────────────────────────
type ErrorAlertProps = {
  message:  string;
  onRetry?: () => void; // 再試行ボタンが必要な場合だけ渡す
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition whitespace-nowrap"
        >
          再試行
        </button>
      )}
    </div>
  );
}
