import * as React from 'react'
import { cn } from '@/lib/utils'

function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted items-center justify-center text-sm font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({ src, alt = '', className, ...props }) {
  const [error, setError] = React.useState(false)

  if (!src || error) return null

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({ children, className, ...props }) {
  return (
    <span
      className={cn('flex size-full items-center justify-center font-medium uppercase', className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
