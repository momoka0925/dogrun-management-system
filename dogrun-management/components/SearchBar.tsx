// components/SearchBar.tsx
// ─────────────────────────────────────────────────────────────
// 顧客検索ボックス
// 入力値を親に渡すだけのシンプルなコンポーネント
//
// 使い方：
//   <SearchBar value={search} onChange={setSearch} />
// ─────────────────────────────────────────────────────────────

type Props = {
  value:    string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative flex-1 w-full">
      {/* 🔍 アイコン（input の左に絶対配置） */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="名前・電話番号・メールで検索..."
        className="
          w-full pl-9 pr-4 py-2.5 rounded-lg
          border border-gray-300 bg-white
          text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder:text-gray-400
          transition
        "
      />
    </div>
  );
}
