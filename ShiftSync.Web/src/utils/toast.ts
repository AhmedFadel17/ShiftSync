import { toast } from 'sonner'



/**
 * Premium toast utility for VidiMetrics.AI
 * Provides consistent styling and behavior for feedback across the application.
 */
export const showToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      className: 'premium-toast success',
    })
  },
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      className: 'premium-toast error',
    })
  },
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      className: 'premium-toast warning',
    })
  },
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      className: 'premium-toast info',
    })
  }
}

/**
 * Generic handler for API operations that manages loading and feedback states.
 */
export const handleGenericAction = async <T>(
  action: () => Promise<T>,
  options: {
    loading?: string
    successTitle: string
    successMessage?: string
    errorTitle: string
  }
): Promise<T | undefined> => {
  try {
    const result = await action()
    showToast.success(options.successTitle, options.successMessage)
    return result
  } catch (error: any) {
    showToast.error(options.errorTitle, error.data?.message || 'A system failure occurred during this operation.')
    return undefined
  }
}
