import { useState, useCallback } from 'react'
import { handleApiError } from './errorHandling'
import { useToast } from '@/components/ToastProvider'

interface UseApiOptions {
    showSuccessToast?: boolean
    showErrorToast?: boolean
    successMessage?: string
}

/**
 * Custom hook for API calls with loading, error handling, and toast notifications
 */
export function useApi<T = any>() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showToast } = useToast()

    const execute = useCallback(
        async (
            apiCall: () => Promise<T>,
            options: UseApiOptions = {}
        ): Promise<T | null> => {
            const {
                showSuccessToast = false,
                showErrorToast = true,
                successMessage = 'Operación exitosa'
            } = options

            setLoading(true)
            setError(null)

            try {
                const result = await apiCall()

                if (showSuccessToast) {
                    showToast(successMessage, 'success')
                }

                return result
            } catch (err) {
                const apiError = handleApiError(err)
                setError(apiError.message)

                if (showErrorToast) {
                    showToast(apiError.message, 'error')
                }

                return null
            } finally {
                setLoading(false)
            }
        },
        [showToast]
    )

    return { execute, loading, error, setError }
}

/**
 * Custom hook for form submission
 */
export function useFormSubmit<T = any>(
    onSubmit: (data: T) => Promise<void>,
    options: UseApiOptions = {}
) {
    const { execute, loading, error } = useApi()

    const handleSubmit = useCallback(
        async (data: T) => {
            await execute(() => onSubmit(data), options)
        },
        [execute, onSubmit, options]
    )

    return { handleSubmit, loading, error }
}
