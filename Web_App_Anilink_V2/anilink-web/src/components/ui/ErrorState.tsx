interface ErrorStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-destructive/10 p-5">
      <h3 className="text-sm font-semibold text-destructive">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
