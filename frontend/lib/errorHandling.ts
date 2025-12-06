import { AxiosError } from 'axios'

export interface ApiError {
    message: string
    status?: number
    code?: string
}

/**
 * Handle API errors and return a user-friendly message
 */
export function handleApiError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
        const status = error.response?.status
        const message = error.response?.data?.error?.message

        // Handle specific status codes
        switch (status) {
            case 400:
                return {
                    message: message || 'Datos inválidos. Por favor verifica la información.',
                    status,
                    code: 'BAD_REQUEST'
                }
            case 401:
                return {
                    message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                    status,
                    code: 'UNAUTHORIZED'
                }
            case 403:
                return {
                    message: 'No tienes permisos para realizar esta acción.',
                    status,
                    code: 'FORBIDDEN'
                }
            case 404:
                return {
                    message: message || 'Recurso no encontrado.',
                    status,
                    code: 'NOT_FOUND'
                }
            case 409:
                return {
                    message: message || 'El recurso ya existe.',
                    status,
                    code: 'CONFLICT'
                }
            case 500:
                return {
                    message: 'Error del servidor. Por favor intenta más tarde.',
                    status,
                    code: 'SERVER_ERROR'
                }
            default:
                return {
                    message: message || 'Ocurrió un error inesperado.',
                    status,
                    code: 'UNKNOWN'
                }
        }
    }

    // Handle network errors
    if (error instanceof Error) {
        if (error.message === 'Network Error') {
            return {
                message: 'Error de conexión. Verifica tu internet.',
                code: 'NETWORK_ERROR'
            }
        }
        return {
            message: error.message,
            code: 'ERROR'
        }
    }

    return {
        message: 'Ocurrió un error inesperado.',
        code: 'UNKNOWN'
    }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError!
}
