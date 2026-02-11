import type { ButtonHTMLAttributes, ReactNode } from 'react'
import classNames from 'classnames'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  icon?: ReactNode
}

export function Chip({ selected, icon, className, children, ...props }: ChipProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary',
        className,
      )}
      {...props}
    >
      {icon ? <span className="text-sm">{icon}</span> : null}
      {children}
    </button>
  )
}
