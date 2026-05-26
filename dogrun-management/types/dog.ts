// types/dog.ts
// ─────────────────────────────────────────────────────────────
// Supabase の dogs テーブルと対応する型定義
// ─────────────────────────────────────────────────────────────

// ── DB から返ってくるデータの型（全カラム） ─────────────────────
export type Dog = {
  id:          string;        // UUID（Supabase が自動生成）
  customer_id: string;        // 紐付く顧客の ID（外部キー）
  name:        string;        // 犬の名前（必須）
  breed:       string | null; // 犬種（任意）
  age:         number | null; // 年齢（任意）
  weight:      number | null; // 体重 kg（任意）
  size:        string;        // "small" | "large"（小型 / 大型）
  vaccinated:  boolean;       // ワクチン接種済みかどうか
  notes:       string | null; // 備考（持病・アレルギーなど）
  created_at:  string;        // 登録日時（ISO 8601 文字列）
};

// ── JOIN して顧客名も一緒に取得したときの型 ──────────────────────
// Supabase で .select("*, customers(name)") すると
// customers: { name: string } が付いてくる
export type DogWithCustomer = Dog & {
  customers: { name: string } | null;
};

// ── フォームの入力値の型 ──────────────────────────────────────
// id / created_at は Supabase が自動付与 → フォームには不要
export type DogFormData = {
  customer_id: string;  // セレクトボックスで選ぶ
  name:        string;
  breed:       string;
  age:         string;  // input は文字列で受け取り、保存時に number に変換
  weight:      string;  // 同上
  size:        string;
  vaccinated:  boolean;
  notes:       string;
};
