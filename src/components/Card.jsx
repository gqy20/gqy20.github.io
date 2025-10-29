import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import './Card.css'

const Card = React.forwardRef(({
  className,
  children,
  variant = 'default',
  padding = 'medium',
  hover = true,
  clickable = false,
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'card'
  const variantClasses = {
    default: 'card-default',
    elevated: 'card-elevated',
    outlined: 'card-outlined',
    glass: 'card-glass'
  }
  const paddingClasses = {
    none: 'card-padding-none',
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large'
  }
  const hoverClasses = hover ? 'card-hover' : ''
  const clickableClasses = clickable ? 'card-clickable' : ''

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    clickableClasses,
    className
  )

  const CardComponent = clickable ? motion.div : 'div'
  const motionProps = clickable ? {
    whileHover: { y: -4, scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <CardComponent
      ref={ref}
      className={classes}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  )
})

Card.displayName = 'Card'

// Card 子组件
const CardHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('card-header', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({
  className,
  children,
  as: Component = 'h3',
  ...props
}, ref) => {
  const classes = cn('card-title', className)
  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  )
})

CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('card-description', className)
  return (
    <p ref={ref} className={classes} {...props}>
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('card-content', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('card-footer', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

const CardActions = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('card-actions', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

CardActions.displayName = 'CardActions'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardActions
}