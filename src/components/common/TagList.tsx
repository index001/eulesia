interface TagListProps {
  tags: string[]
  onTagClick?: (tag: string) => void
  size?: 'sm' | 'md'
}

export function TagList({ tags, onTagClick, size = 'sm' }: TagListProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className={`${sizeClasses} bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors`}
        >
          {tag.replace('-', ' ')}
        </button>
      ))}
    </div>
  )
}
