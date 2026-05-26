// app/page.tsx
// ─────────────────────────────────────────────────────────────
// 顧客管理のメインページ
//
// このファイルが担う責務：
//   1. Supabase から顧客一覧を取得（fetchCustomers）
//   2. 顧客の削除（handleDelete）
//   3. 編集対象の切り替え管理（editTarget）
//   4. 検索フィルター（filtered）
//   5. 各コンポーネントを組み合わせて画面を構成する
//
// INSERT / UPDATE は CustomerForm コンポーネント内で行う
// ─────────────────────────────────────────────────────────────

"use client"; // useEffect / useState を使うので必須

import { useState, useEffect } from "react";

import { supabase }    from "@/lib/supabaseClient";
import CustomerForm     from "@/components/CustomerForm";
import CustomerTable    from "@/components/CustomerTable";
import SearchBar        from "@/components/SearchBar";
import { ErrorAlert }   from "@/components/ui";

import type { Customer } from "@/types/customer";

export default function HomePage() {

  // ── State 定義 ──────────────────────────────────────────────
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [loading,    setLoading]    = useState<boolean>(true);
  const [error,      setError]      = useState<string>("");
  const [search,     setSearch]     = useState<string>("");

  // 編集対象の顧客（null なら「追加モード」）
  const [editTarget, setEditTarget] = useState<Customer | null>(null);

  // ── 顧客一覧取得 ────────────────────────────────────────────
  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false }); // 新しい順

    setLoading(false);

    if (err) {
      setError("データの取得に失敗しました：" + err.message);
      return;
    }

    setCustomers(data as Customer[]);
  };

  // ── ページ表示時に1回だけ取得 ────────────────────────────────
  // [] を忘れると毎レンダリングで無限ループになるので注意！
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ── 顧客削除 ────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    // 誤操作防止のための確認ダイアログ
    const confirmed = window.confirm(
      `「${name}」を削除しますか？\nこの操作は取り消せません。`
    );
    if (!confirmed) return;

    // .delete().eq("id", id) で指定した1行だけ削除
    const { error: err } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (err) {
      setError("削除に失敗しました：" + err.message);
      return;
    }

    // 削除対象が編集中だった場合はフォームを閉じる
    if (editTarget?.id === id) setEditTarget(null);

    fetchCustomers(); // 一覧を再取得
  };

  // ── 検索フィルター ──────────────────────────────────────────
  // customers 配列から検索ワードに一致するものだけ残す
  const filtered: Customer[] = customers.filter((c) => {
    const word = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(word)          ||
      (c.phone ?? "").includes(word)               ||
      (c.email ?? "").toLowerCase().includes(word)
    );
  });

  // ── JSX ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── ページヘッダー ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👥 顧客管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              顧客の追加・編集・削除・検索ができます
            </p>
          </div>

          {/* 犬管理ページへのナビゲーションボタン */}
          {/* href="/dogs" でそのままページ遷移する */}
          <a
            href="/dogs"
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-amber-50 border border-amber-200 text-amber-700
              hover:bg-amber-100 transition whitespace-nowrap flex-shrink-0
            "
          >
            🐕 犬管理へ
          </a>
        </div>

        {/* ── エラー表示（取得・削除のエラー） ── */}
        {error && (
          <ErrorAlert message={error} onRetry={fetchCustomers} />
        )}

        {/* ── 顧客フォーム ──────────────────────────────────────
            editTarget が null → 追加モード
            editTarget が Customer → 編集モード
            onDone: 完了後に一覧を再取得
            onCancel: 編集をキャンセルして追加モードに戻す
        ── */}
        <CustomerForm
          onDone={() => {
            fetchCustomers();
            setEditTarget(null); // 編集完了後は追加モードに戻す
          }}
          editTarget={editTarget ?? undefined}
          onCancel={() => setEditTarget(null)}
        />

        {/* ── 検索バー ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length} 件 / 全 {customers.length} 件
          </span>
        </div>

        {/* ── 顧客テーブル ─────────────────────────────────────
            onEdit: 編集ボタンを押すと editTarget をセット
                    → CustomerForm が編集モードに切り替わる
            onDelete: 削除ボタンを押すと handleDelete を実行
        ── */}
        <CustomerTable
          customers={filtered}
          loading={loading}
          totalCount={customers.length}
          onEdit={(customer) => {
            setEditTarget(customer);
            // スマホでフォームが見えるようにページ上部へスクロール
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={handleDelete}
        />

      </div>
    </main>
  );
}