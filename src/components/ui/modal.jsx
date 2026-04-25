import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { FaTimes } from 'react-icons/fa'
import Button from './button.jsx'
import './modal.css'

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'medium',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ...props
}) => {
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose()
  }

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    xlarge: 'modal-xlarge',
    fullscreen: 'modal-fullscreen'
  }

  const variantClasses = {
    default: 'modal-default',
    elevated: 'modal-elevated',
    glass: 'modal-glass'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn('fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm', sizeClasses[size], variantClasses[variant], className)}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          <motion.div
            className={cn(
              'bg-background rounded-xl border shadow-xl max-w-full max-h-full flex flex-col overflow-hidden',
              size === 'fullscreen' && 'w-screen h-screen rounded-none',
              size === 'small' && 'max-w-[400px]',
              size === 'medium' && 'max-w-[600px]',
              size === 'large' && 'max-w-[800px]',
              size === 'xlarge' && 'max-w-[1200px]',
              variant === 'glass' && 'bg-white/90 backdrop-blur-xl border-white/20',
              variant === 'elevated' && 'shadow-2xl'
            )}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b shrink-0">
                <div className="flex-1 min-w-0">
                  {title && (
                    <>
                      <h2 className="text-lg font-semibold text-foreground m-0 leading-snug">{title}</h2>
                      {description && <p className="text-sm text-muted-foreground mt-1 mb-0 leading-relaxed">{description}</p>}
                    </>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="-mt-1 -mr-1"
                    aria-label="关闭对话框"
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

Modal.displayName = 'Modal'

const ModalHeader = React.forwardRef(({ className, children, ...props }, ref) =>
  <div ref={ref} className={cn('flex items-start justify-between gap-4 p-6 pb-4 border-b shrink-0', className)} {...props}>{children}</div>)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef(({ className, children, ...props }, ref) =>
  <h2 ref={ref} className={cn('text-lg font-semibold text-foreground m-0 leading-snug', className)} {...props}>{children}</h2>
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef(({ className, children, ...props }, ref) =>
  <p ref={ref} className={cn('text-sm text-muted-foreground mt-1 mb-0 leading-relaxed', className)} {...props}>{children}</p>
)
ModalDescription.displayName = 'ModalDescription'

const ModalBody = React.forwardRef(({ className, children, ...props }, ref) =>
  <div ref={ref} className={cn('p-6 overflow-y-auto flex-1 min-h-0', className)} {...props}>{children}</div>
)
ModalBody.displayName = 'ModalBody'

const ModalFooter = React.forwardRef(({ className, children, ...props }, ref) =>
  <div ref={ref} className={cn('flex items-center justify-end gap-3 p-4 pt-4 border-t shrink-0', className)} {...props}>{children}</div>
)
ModalFooter.displayName = 'ModalFooter'

const ModalActions = ({ onConfirm, onCancel, confirmText = '确认', cancelText = '取消', confirmVariant = 'default', confirmDisabled = false, loading = false, children }) => (
  <ModalFooter>
    {children || (
      <div className="flex items-center gap-3 w-full justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelText}</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={confirmDisabled || loading}>{loading ? '处理中...' : confirmText}</Button>
      </div>
    )}
  </ModalFooter>
)

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = '确认操作', message = '您确定要执行此操作吗？', confirmText = '确认', cancelText = '取消', confirmVariant = 'destructive', loading = false, ...modalProps }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="small" {...modalProps}>
    <div className="text-center py-2"><p className="text-foreground my-6 leading-relaxed">{message}</p></div>
    <ModalActions onConfirm={onConfirm} onCancel={onClose} confirmText={confirmText} cancelText={cancelText} confirmVariant={confirmVariant} loading={loading} />
  </Modal>
)

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalActions, ConfirmModal }
