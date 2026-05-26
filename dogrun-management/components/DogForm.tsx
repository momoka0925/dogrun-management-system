// components/DogForm.tsx
// ─────────────────────────────────────────────────────────────
// 犬の「追加」と「編集」を1つのフォームで兼用するコンポーネント
//
// 【追加モード】editTarget を渡さない → INSERT
// 【編集モード】editTarget に Dog を渡す  → UPDATE
//
// 顧客とのリレーション：
//   customer_id（外部キー）で customers テーブルと紐付ける
//   セレクトボックスに顧客一覧を表示して選んでもらう
//
// 使い方：
//   <DogForm customers={customers} onDone={fetchDogs} />
//   <DogForm customers={customers} onDone={fetchDogs}
//            editTarget={dog} onCancel={() => setEditTarget(null)} />
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { supabase }            from "@/lib/supabaseClient";
import { Button }              from "@/components/ui";
import type { Customer }       from "@/types/customer";
import type { Dog, DogFormData } from "@/types/dog";

// ── フォームの初期値 ─────────────────────────────────────────
const INITIAL_FORM: DogFormData = {
  customer_id: "",
  name:        "",
  breed:       "",
  age:         "",
  weight:      "",
  size:        "small",
  vaccinated:  false,
  notes:       "",
};

type Props = {
  customers:   Customer[];   // 顧客セレクトボックス用
  onDone:      () => void;   // 登録・更新完了後に親が渡す「一覧再取得関数」
  editTarget?: Dog;          // 編集対象（未指定なら追加モード）
  onCancel?:   () => void;   // 編集キャンセルボタン用
};

export default function DogForm({ customers, onDone, editTarget, onCancel }: Props) {

  const isEditMode = !!editTarget;

  // ── フォームの入力値 ───────────────────────────────────────
  const [form,    setForm]    = useState<DogFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // ── 編集モードのとき既存の値をフォームにセット ────────────────
  // editTarget が変わるたびに実行される
  useEffect(() => {
    if (editTarget) {
      setForm({
        customer_id: editTarget.customer_id,
        name:        editTarget.name,
        breed:       editTarget.breed   ?? "",
        age:         editTarget.age     != null ? String(editTarget.age)    : "",
        weight:      editTarget.weight  != null ? String(editTarget.weight) : "",
        size:        editTarget.size,
        vaccinated:  editTarget.vaccinated,
        notes:       editTarget.notes   ?? "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setError("");
    setSuccess(false);
  }, [editTarget]);

  // ── テキスト系の入力値更新ヘルパー ────────────────────────────
  // key に "name" などを渡すと、そのキーだけ更新する
  const handleChange =
    (key: keyof DogFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setError("");
      setSuccess(false);
    };

  // ── チェックボックス専用の更新ヘルパー ────────────────────────
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, vaccinated: e.target.checked }));
  };

  // ── バリデーション ────────────────────────────────────────────
  const validate = (): string => {
    if (!form.customer_id)   return "オーナー（顧客）を選択してください";
    if (!form.name.trim())   return "犬の名前を入力してください";
    if (form.age && isNaN(Number(form.age)))     return "年齢は数字で入力してください";
    if (form.weight && isNaN(Number(form.weight))) return "体重は数字で入力してください";
    return "";
  };

  // ── 送信処理（INSERT / UPDATE を自動切り替え） ────────────────
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    // フォームの値を DB 保存用に整形
    // 空文字 → null、数値文字列 → number に変換
    const payload = {
      customer_id: form.customer_id,
      name:        form.name.trim(),
      breed:       form.breed.trim()  || null,
      age:         form.age           ? Number(form.age)    : null,
      weight:      form.weight        ? Number(form.weight) : null,
      size:        form.size,
      vaccinated:  form.vaccinated,
      notes:       form.notes.trim()  || null,
    };

    if (isEditMode) {
      // ── UPDATE：指定 ID の行だけ更新 ──────────────────────────
      const { error: err } = await supabase
        .from("dogs")
        .update(payload)
        .eq("id", editTarget!.id);

      if (err) { setError("更新に失敗しました：" + err.message); setLoading(false); return; }

    } else {
      // ── INSERT：新規行を追加 ───────────────────────────────────
      const { error: err } = await supabase
        .from("dogs")
        .insert([payload]);

      if (err) { setError("登録に失敗しました：" + err.message); setLoading(false); return; }
    }

    setLoading(false);
    setSuccess(true);
    setForm(INITIAL_FORM);
    onDone(); // 親に「一覧を再取得して」と伝える
  };

  // ── JSX ───────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

      {/* タイトル */}
      <h2 className="text-base font-bold text-gray-900 pb-4 mb-5 border-b border-gray-100">
        {isEditMode ? "✏️ 犬の情報を編集" : "🐕 犬を追加する"}
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
          ✅ {isEditMode ? "犬の情報を更新しました" : "犬を登録しました"}
        </div>
      )}

      {/* ── 行1：オーナー / 犬の名前 / 犬種 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {/* オーナー（顧客セレクト）*/}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            オーナー <span className="text-red-500">*</span>
          </label>
          {/* select の値が変わると customer_id が更新される */}
          <select
            value={form.customer_id}
            onChange={handleChange("customer_id")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent transition"
          >
            <option value="">-- 選択してください --</option>
            {/* customers 配列をループして option を生成 */}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 犬の名前 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            犬の名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="ポチ"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>

        {/* 犬種 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            犬種
          </label>
          <input
            type="text"
            value={form.breed}
            onChange={handleChange("breed")}
            placeholder="柴犬"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>
      </div>

      {/* ── 行2：年齢 / 体重 / サイズ ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {/* 年齢 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            年齢（歳）
          </label>
          <input
            type="number"
            value={form.age}
            onChange={handleChange("age")}
            placeholder="3"
            min="0"
            max="30"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>

        {/* 体重 */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            体重（kg）
          </label>
          <input
            type="number"
            value={form.weight}
            onChange={handleChange("weight")}
            placeholder="8.5"
            min="0"
            step="0.1"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition"
          />
        </div>

        {/* サイズ（小型 / 大型） */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            サイズ
          </label>
          <select
            value={form.size}
            onChange={handleChange("size")}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent transition"
          >
            <option value="small">小型犬（10kg 未満）</option>
            <option value="large">大型犬（10kg 以上）</option>
          </select>
        </div>
      </div>

      {/* ── 行3：備考 / ワクチン ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        {/* 備考（2列分） */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-900 mb-1.5">
            備考（持病・アレルギーなど）
          </label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="特記事項があれば記入してください"
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 transition resize-none"
          />
        </div>

        {/* ワクチン接種状況（チェックボックス） */}
        <div className="flex flex-col justify-center">
          <label className="block text-sm font-bold text-gray-900 mb-3">
            ワクチン接種
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.vaccinated}
                onChange={handleCheckbox}
                className="sr-only" // 見た目は非表示、カスタムデザインを使う
              />
              {/* カスタムチェックボックスの見た目 */}
              <div className={`
                w-11 h-6 rounded-full transition-colors duration-200
                ${form.vaccinated ? "bg-emerald-500" : "bg-gray-300"}
              `} />
              <div className={`
                absolute top-0.5 left-0.5
                w-5 h-5 bg-white rounded-full shadow-sm
                transition-transform duration-200
                ${form.vaccinated ? "translate-x-5" : "translate-x-0"}
              `} />
            </div>
            <span className={`text-sm font-semibold ${form.vaccinated ? "text-emerald-700" : "text-gray-500"}`}>
              {form.vaccinated ? "接種済み ✓" : "未接種"}
            </span>
          </label>
        </div>
      </div>

      {/* ボタン行 */}
      <div className="flex justify-end gap-3">
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
