import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { FaTimes } from 'react-icons/fa'
import Button from './Button'
import './Modal.css'

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
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
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

  const classes = cn(
    'modal-backdrop',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={classes}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div className="modal-header">
                <div className="modal-header-content">
                  {title && (
                    <div className="modal-title-section">
                      <h2 className="modal-title">{title}</h2>
                      {description && (
                        <p className="modal-description">{description}</p>
                      )}
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="modal-close-button"
                    aria-label="关闭对话框"
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

Modal.displayName = 'Modal'

// Modal 子组件
const ModalHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('modal-custom-header', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('modal-custom-title', className)
  return (
    <h2 ref={ref} className={classes} {...props}>
      {children}
    </h2>
  )
})

ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('modal-custom-description', className)
  return (
    <p ref={ref} className={classes} {...props}>
      {children}
    </p>
  )
})

ModalDescription.displayName = 'ModalDescription'

const ModalBody = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('modal-custom-body', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

ModalBody.displayName = 'ModalBody'

const ModalFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const classes = cn('modal-footer', className)
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

ModalFooter.displayName = 'ModalFooter'

// Modal Actions - 常用的操作按钮组合
const ModalActions = ({
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'default',
  confirmDisabled = false,
  loading = false,
  children
}) => {
  return (
    <ModalFooter>
      {children || (
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={confirmDisabled || loading}
          >
            {loading ? '处理中...' : confirmText}
          </Button>
        </div>
      )}
    </ModalFooter>
  )
}

// Confirm Modal - 确认对话框
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message = '您确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'destructive',
  loading = false,
  ...modalProps
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      {...modalProps}
    >
      <div className="confirm-modal-content">
        <p className="confirm-message">{message}</p>
        <ModalActions
          onConfirm={onConfirm}
          onCancel={onClose}
          confirmText={confirmText}
          cancelText={cancelText}
          confirmVariant={confirmVariant}
          loading={loading}
        />
      </div>
    </Modal>
  )
}

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalActions,
  ConfirmModal
}