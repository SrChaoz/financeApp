/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-MX').format(num)
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, ''))
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(later, wait)
    }
}

/**
 * Get color based on percentage
 */
export function getPercentageColor(percentage: number): string {
    if (percentage >= 100) return 'text-red-400'
    if (percentage >= 80) return 'text-yellow-400'
    return 'text-green-400'
}

/**
 * Get background color based on percentage
 */
export function getPercentageBgColor(percentage: number): string {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
}
