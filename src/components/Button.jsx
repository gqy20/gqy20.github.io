import React from 'react'
import { cn } from '../lib/utils'

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'button-base inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'bg-blue-500 text-white hover:bg-blue-600',
    github: 'bg-[#24292e] text-white border-[#333] hover:bg-[#333] hover:translate-y-[-2px] hover:shadow-lg',
    contact: 'bg-white/10 text-current border-2 hover:bg-primary hover:text-white hover:border-primary hover:translate-y-[-2px] hover:shadow-lg',
  }

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
    xl: 'h-12 rounded-lg px-10 text-base',
  }

  const Comp = asChild ? 'span' : 'button'

  return (
    <Comp
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})

Button.displayName = 'Button'

export default Button