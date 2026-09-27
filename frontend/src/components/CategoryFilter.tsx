import type { Category } from '../types'

interface Props {
  categories: Category[]
  selected: number | null
  onSelect: (id: number | null) => void
}

const base = 'px-4 py-2 rounded-full text-sm font-medium transition-colors'

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  const buttonClass = (active: boolean) =>
    `${base} ${active ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)} className={buttonClass(selected === null)}>
        Todas
      </button>
      {categories.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} className={buttonClass(selected === c.id)}>
          {c.name}
        </button>
      ))}
    </div>
  )
}
