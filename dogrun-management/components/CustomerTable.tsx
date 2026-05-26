// components/CustomerTable.tsx
// ─────────────────────────────────────────────────────────────
// 顧客一覧をテーブル形式で表示するコンポーネント
// ローディング中 / 0件 / データありの3状態を出し分ける
//
// 使い方：
//   <CustomerTable
//     customers={filtered}
//     loading={loading}
//     onEdit={(customer) => setEditTarget(customer)}
//     onDelete={(id) => handleDelete(id)}
//   />
// ─────────────────────────────────────────────────────────────

import { Spinner, EmptyState, StatusBadge, Button } from "@/components/ui";
import type { Customer } from "@/types/customer";

type Props = {
  customers:  Customer[];
  loading:    boolean;
  totalCount: number;       // 検索前の全件数（フッター表示用）
  onEdit:     (customer: Customer) => void;
  onDelete:   (id: string, name: string) => void;
};

export default function CustomerTable({
  customers,
  loading,
  totalCount,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── ローディング中 ── */}
      {loading && <Spinner />}

      {/* ── データ表示 ── */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">

            {/* テーブルヘッダー */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["顧客名", "電話番号", "メール", "状態", "登録日", "操作"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* 0件のとき */}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="顧客が見つかりません。上のフォームから追加してください。" />
                  </td>
                </tr>
              )}

              {/* 顧客データを1行ずつ表示 */}
              {customers.map((c, i) => (
                <tr
                  key={c.id}
                  className={`
                    border-b border-gray-100 last:border-0
                    hover:bg-blue-50 transition-colors
                    ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                  `}
                >
                  {/* 顧客名（アバター付き） */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* 名前の頭文字をアバターとして表示 */}
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <span className="font-semibold text-gray-900">{c.name}</span>
                    </div>
                  </td>

                  {/* 電話番号（null なら「—」） */}
                  <td className="px-4 py-3 text-gray-600">
                    {c.phone ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* メール（null なら「—」） */}
                  <td className="px-4 py-3 text-gray-600">
                    {c.email ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* ステータスバッジ */}
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* 登録日（日本語形式） */}
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("ja-JP")}
                  </td>

                  {/* 操作ボタン（編集・削除） */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => onEdit(c)}>
                        ✏️ 編集
                      </Button>
                      <Button variant="danger" onClick={() => onDelete(c.id, c.name)}>
                        🗑 削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* フッター：件数表示 */}
      {!loading && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400">
            {customers.length} 件表示 / 全 {totalCount} 件
          </span>
        </div>
      )}
    </div>
  );
}
