// app/dogs/page.tsx
// ─────────────────────────────────────────────────────────────
// 犬管理のメインページ
//
// このファイルが担う責務：
//   1. Supabase から犬一覧を取得（fetchDogs）
//      → customers テーブルと JOIN してオーナー名も取得
//   2. Supabase から顧客一覧を取得（fetchCustomers）
//      → DogForm のセレクトボックスに渡す
//   3. 犬の削除（handleDelete）
//   4. 編集対象の切り替え管理（editTarget）
//   5. 名前 / オーナー名 / 犬種での検索フィルター
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";

import { supabase }    from "@/lib/supabaseClient";
import DogForm          from "@/components/DogForm";
import DogTable         from "@/components/DogTable";
import SearchBar        from "@/components/SearchBar";
import { ErrorAlert }   from "@/components/ui";

import type { Customer }                  from "@/types/customer";
import type { DogWithCustomer }           from "@/types/dog";

export default function DogsPage() {

  // ── State 定義 ──────────────────────────────────────────────
  const [dogs,       setDogs]       = useState<DogWithCustomer[]>([]);
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [loading,    setLoading]    = useState<boolean>(true);
  const [error,      setError]      = useState<string>("");
  const [search,     setSearch]     = useState<string>("");

  // 編集対象の犬（null なら「追加モード」）
  const [editTarget, setEditTarget] = useState<DogWithCustomer | null>(null);

  // ── 犬一覧取得（顧客名も JOIN して取得） ─────────────────────
  const fetchDogs = async () => {
    setLoading(true);
    setError("");

    // ★ ポイント：Supabase のリレーション JOIN
    // .select("*, customers(name)") と書くと
    // dogs テーブルの全カラム + 紐付く customers の name カラムを取得できる
    // customer_id が外部キーとして設定されている前提
    const { data, error: err } = await supabase
      .from("dogs")
      .select("*, customers(name)")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (err) {
      setError("犬データの取得に失敗しました：" + err.message);
      return;
    }

    setDogs(data as DogWithCustomer[]);
  };

  // ── 顧客一覧取得（DogForm のセレクトボックス用） ─────────────
  const fetchCustomers = async () => {
    const { data, error: err } = await supabase
      .from("customers")
      .select("id, name, phone, email, status, created_at")
      .eq("status", "active")   // 有効な顧客だけ表示
      .order("name");

    if (err) return; // 顧客取得エラーは致命的でないのでサイレントに処理
    setCustomers(data as Customer[]);
  };

  // ── ページ表示時に犬・顧客を同時取得 ─────────────────────────
  useEffect(() => {
    // Promise.all で2つの非同期処理を並行して実行（速い）
    Promise.all([fetchDogs(), fetchCustomers()]);
  }, []);

  // ── 犬の削除 ─────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `「${name}」を削除しますか？\nこの操作は取り消せません。`
    );
    if (!confirmed) return;

    const { error: err } = await supabase
      .from("dogs")
      .delete()
      .eq("id", id);

    if (err) {
      setError("削除に失敗しました：" + err.message);
      return;
    }

    // 削除対象が編集中だった場合はフォームを閉じる
    if (editTarget?.id === id) setEditTarget(null);

    fetchDogs();
  };

  // ── 検索フィルター ────────────────────────────────────────────
  // 犬の名前 / オーナー名 / 犬種で絞り込む
  const filtered: DogWithCustomer[] = dogs.filter((d) => {
    const word = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(word)                          ||
      (d.customers?.name ?? "").toLowerCase().includes(word)       ||
      (d.breed ?? "").toLowerCase().includes(word)
    );
  });

  // ── JSX ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── ページヘッダー ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {/* パンくず風のリンク */}
            <p className="text-xs text-gray-400 mb-1">
              <a href="/" className="hover:text-blue-500 transition">顧客管理</a>
              <span className="mx-1">›</span>
              犬管理
            </p>
            <h1 className="text-2xl font-bold text-gray-900">🐕 犬管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              犬の追加・編集・削除・検索ができます
            </p>
          </div>

          {/* 顧客管理ページへ戻るボタン */}
          <a
            href="/"
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-blue-50 border border-blue-200 text-blue-700
              hover:bg-blue-100 transition whitespace-nowrap flex-shrink-0
            "
          >
            👥 顧客管理へ
          </a>
        </div>

        {/* ── サマリーカード ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryCard
            label="登録犬数"
            value={dogs.length}
            icon="🐕"
            color="bg-amber-50 border-amber-200"
          />
          <SummaryCard
            label="小型犬"
            value={dogs.filter((d) => d.size === "small").length}
            icon="🐩"
            color="bg-sky-50 border-sky-200"
          />
          <SummaryCard
            label="大型犬"
            value={dogs.filter((d) => d.size === "large").length}
            icon="🦮"
            color="bg-purple-50 border-purple-200"
          />
          <SummaryCard
            label="ワクチン済み"
            value={dogs.filter((d) => d.vaccinated).length}
            icon="✅"
            color="bg-emerald-50 border-emerald-200"
          />
        </div>

        {/* ── エラー表示 ── */}
        {error && (
          <ErrorAlert message={error} onRetry={fetchDogs} />
        )}

        {/* ── 犬フォーム ─────────────────────────────────────────
            customers: セレクトボックス用の顧客リスト
            editTarget が null → 追加モード
            editTarget が DogWithCustomer → 編集モード
        ── */}
        <DogForm
          customers={customers}
          onDone={() => {
            fetchDogs();
            setEditTarget(null);
          }}
          editTarget={editTarget ?? undefined}
          onCancel={() => setEditTarget(null)}
        />

        {/* ── 検索バー ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length} 件 / 全 {dogs.length} 件
          </span>
        </div>

        {/* ── 犬テーブル ──────────────────────────────────────────
            onEdit: 編集ボタンで editTarget をセット → フォームが編集モードに
            onDelete: 削除ボタンで handleDelete を実行
        ── */}
        <DogTable
          dogs={filtered}
          loading={loading}
          totalCount={dogs.length}
          onEdit={(dog) => {
            setEditTarget(dog);
            window.scrollTo({ top: 0, behavior: "smooth" }); // スマホ対応
          }}
          onDelete={handleDelete}
        />

      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 内部コンポーネント：サマリーカード
// ─────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon:  string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}