// types/customer.ts
// ─────────────────────────────────────────────────────────────
// Supabase の customers テーブルと対応する型定義
// TypeScript はここで定義した型を元に、
// タイポや型ミスをコード補完・コンパイル時に検出してくれる
// ─────────────────────────────────────────────────────────────

// DB から返ってくるデータの型（全カラム）
export type Customer = {
  id:         string;        // UUID（Supabase が自動生成）
  name:       string;        // 氏名（必須）
  phone:      string | null; // 電話番号（未入力なら null）
  email:      string | null; // メール（未入力なら null）
  status:     string;        // "active" | "inactive"
  created_at: string;        // 登録日時（ISO 8601 文字列）
};

// 追加・編集フォームで使う型
// id / status / created_at は Supabase が自動付与 → フォームには不要
export type CustomerFormData = {
  name:  string;
  phone: string;
  email: string;
};
