// components/CustomerForm.tsx
// ─────────────────────────────────────────────────────────────
// 顧客の「追加」と「編集」を1つのフォームで兼用するコンポーネント
//
// 【追加モード】editTarget を渡さない → INSERT
// 【編集モード】editTarget に Customer を渡す → UPDATE
//
// 使い方：
//   <CustomerForm onDone={fetchCustomers} />
//   <CustomerForm onDone={fetchCustomers} editTarget={customer} onCancel={() => setEditing(null)} />
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { supabase }               from "@/lib/supabaseClient";
import { Button }                 from "@/components/ui";
import type { Customer, CustomerFormData } from "@/types/customer";

type Props = {
  onDone:       () => void;    // 登録・更新完了後に親が渡す「一覧再取得関数」
  editTarget?:  Customer;      // 編集対象（未指定なら追加モード）
  onCancel?:    () => void;    // 編集キャンセルボタン用
};

export default function CustomerForm({ onDone, editTarget, onCancel }: Props) {

  const isEditMode = !!editTarget; // editTarget があれば編集モード

  // ── フォームの入力値 ───────────────────────────────────────
  const [form, setForm] = useState<CustomerFormData>({
    name:  "",
    phone: "",
    email: "",
  });

  // ── UI 状態 ────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // ── 編集モードのとき、フォームに既存の値をセット ────────────
  // editTarget が変わるたびに実行される
  useEffect(() => {
    if (editTarget) {
      setForm({
        name:  editTarget.name,
        phone: editTarget.phone  ?? "",
        email: editTarget.email  ?? "",
      });
    } else {
      // 追加モードに切り替わったときはリセット
      setForm({ name: "", phone: "", email: "" });
    }
    setError("");
    setSuccess(false);
  }, [editTarget]);

  // ── 入力値の更新ヘルパー ──────────────────────────────────
  const handleChange =
    (key: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setError("");
      setSuccess(false);
    };

  // ── バリデーション ────────────────────────────────────────
  const validate = (): string => {
    if (!form.name.trim()) return "氏名を入力してください";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "メールアドレスの形式が正しくありません";
    }
    return "";
  };

  // ── 送信処理（追加 or 更新を自動で切り替え） ────────────────
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    // 空文字は null として保存（DB 設計に合わせる）
    const payload = {
      name:  form.name.trim(),
      phone: form.phone.trim()  || null,
      email: form.email.trim()  || null,
    };

    if (isEditMode) {
      // ── UPDATE ────────────────────────────────────────────
      // .eq("id", editTarget.id) で「このIDの行だけ」を更新
      const { error: err } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", editTarget!.id);

      if (err) { setError("更新に失敗しました：" + err.message); setLoading(false); return; }

    } else {
      // ── INSERT ────────────────────────────────────────────
      const { error: err } = await supabase
        .from("customers")
        .insert([{ ...payload, status: "active" }]);

      if (err) { setError("登録に失敗しました：" + err.message); setLoading(false); return; }
    }

    setLoading(false);
    setSuccess(true);
    setForm({ name: "", phone: "", email: "" });
    onDone(); // 親に「一覧を再取得して」と伝える
  };

  // ── JSX ───────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

      {/* タイトル：モードによって変える */}
      <h2 className="text-base font-bold text-gray-900 pb-4 mb-5 border-b border-gray-100">
        {isEditMode ? "✏️ 顧客情報を編集" : "➕ 顧客を追加する"}
      </h2>

      {/* エラーメッセージ */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm font-semibold border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* 成功メッセージ */}
      {success && (
        <div className="flex items-center gap-2 bg-green-100 text-green-900 rounded-lg px-4 py-3 mb-4 text-sm font-bold border border-green-400">
          ✅ {isEditMode ? "顧客情報を更新しました" : "顧客を登録しました"}
        </div>
      )}

      {/* 入力フィールド（スマホ1列 / PC 3列） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        {/* 氏名 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="田中 花子"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            電話番号
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="090-0000-0000"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            メールアドレス
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="example@email.com"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>
      </div>

      {/* ボタン行 */}
      <div className="flex justify-end gap-3">
        {/* 編集モードのときだけキャンセルボタンを表示 */}
        {isEditMode && onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? (isEditMode ? "更新中..." : "登録中...")
            : (isEditMode ? "✓ 更新する" : "✓ 登録する")}
        </Button>
      </div>
    </div>
  );
}
