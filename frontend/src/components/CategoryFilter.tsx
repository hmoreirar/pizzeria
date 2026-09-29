import type { Category } from '../types'

interface Props {
  categories: Category[]
  selected: number | null
  onSelect: (id: number | null) => void
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  const pill = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? 'bg-brand text-white'
        : 'border border-brand/25 bg-white text-brand hover:bg-brand/5'
    }`

  return (
    <nav aria-label="Categorías" className="flex gap-2 overflow-x-auto pb-1">
      <button type="button" onClick={() => onSelect(null)} className={pill(selected === null)}>
        Todas
      </button>
      {categories.map((c) => (
        <button
          type="button"
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={pill(selected === c.id)}
        >
          {c.name}
        </button>
      ))}
    </nav>
  )
}
