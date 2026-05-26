// components/DogTable.tsx
// ─────────────────────────────────────────────────────────────
// 犬一覧をテーブル形式で表示するコンポーネント
// ローディング中 / 0件 / データありの3状態を出し分ける
//
// 使い方：
//   <DogTable
//     dogs={filtered}
//     loading={loading}
//     totalCount={dogs.length}
//     onEdit={(dog) => setEditTarget(dog)}
//     onDelete={(id, name) => handleDelete(id, name)}
//   />
// ─────────────────────────────────────────────────────────────

import { Spinner, EmptyState, Button } from "@/components/ui";
import type { DogWithCustomer }         from "@/types/dog";

type Props = {
  dogs:       DogWithCustomer[];
  loading:    boolean;
  totalCount: number;
  onEdit:     (dog: DogWithCustomer) => void;
  onDelete:   (id: string, name: string) => void;
};

export default function DogTable({ dogs, loading, totalCount, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ローディング中 */}
      {loading && <Spinner />}

      {/* データ表示 */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">

            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["犬の名前", "オーナー", "犬種", "年齢 / 体重", "サイズ", "ワクチン", "登録日", "操作"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* 0件のとき */}
              {dogs.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="犬のデータがありません。上のフォームから追加してください。" />
                  </td>
                </tr>
              )}

              {dogs.map((dog, i) => (
                <tr
                  key={dog.id}
                  className={`
                    border-b border-gray-100 last:border-0
                    hover:bg-amber-50 transition-colors
                    ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                  `}
                >
                  {/* 犬の名前（アバター付き） */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* サイズによってアバターの色を変える */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0
                        ${dog.size === "small"
                          ? "bg-sky-100"      // 小型犬：水色
                          : "bg-purple-100"}  // 大型犬：紫
                      `}>
                        🐕
                      </div>
                      <span className="font-semibold text-gray-900">{dog.name}</span>
                    </div>
                  </td>

                  {/* オーナー名（JOIN で取得した customers.name） */}
                  <td className="px-4 py-3 text-gray-600">
                    {dog.customers?.name ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* 犬種 */}
                  <td className="px-4 py-3 text-gray-600">
                    {dog.breed ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* 年齢 / 体重（まとめて表示） */}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span>{dog.age != null ? `${dog.age}歳` : "—"}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span>{dog.weight != null ? `${dog.weight}kg` : "—"}</span>
                  </td>

                  {/* サイズバッジ */}
                  <td className="px-4 py-3">
                    <SizeBadge size={dog.size} />
                  </td>

                  {/* ワクチンバッジ */}
                  <td className="px-4 py-3">
                    <VaccineBadge vaccinated={dog.vaccinated} />
                  </td>

                  {/* 登録日 */}
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(dog.created_at).toLocaleDateString("ja-JP")}
                  </td>

                  {/* 操作ボタン */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => onEdit(dog)}>
                        ✏️ 編集
                      </Button>
                      <Button variant="danger" onClick={() => onDelete(dog.id, dog.name)}>
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

      {/* フッター */}
      {!loading && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400">
            {dogs.length} 件表示 / 全 {totalCount} 件
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 内部コンポーネント：サイズバッジ
// ─────────────────────────────────────────────────────────────
function SizeBadge({ size }: { size: string }) {
  const isSmall = size === "small";
  return (
    <span className={`
      inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
      ${isSmall
        ? "bg-sky-100 text-sky-700"       // 小型：水色
        : "bg-purple-100 text-purple-700"} // 大型：紫
    `}>
      {isSmall ? "🐩 小型犬" : "🦮 大型犬"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 内部コンポーネント：ワクチンバッジ
// ─────────────────────────────────────────────────────────────
function VaccineBadge({ vaccinated }: { vaccinated: boolean }) {
  return (
    <span className={`
      inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
      ${vaccinated
        ? "bg-emerald-100 text-emerald-700" // 接種済み：緑
        : "bg-red-100 text-red-600"}         // 未接種：赤
    `}>
      {vaccinated ? "✅ 接種済み" : "❌ 未接種"}
    </span>
  );
}
