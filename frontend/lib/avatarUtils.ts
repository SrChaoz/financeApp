/**
 * Get initials from name or username
 * @param firstName - User's first name (optional)
 * @param lastName - User's last name (optional)
 * @param username - User's username (fallback)
 * @returns Initials (1-2 characters)
 */
export function getInitials(firstName?: string | null, lastName?: string | null, username?: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

    if (firstName) {
        return firstName.substring(0, 2).toUpperCase()
    }

    if (username) {
        return username.substring(0, 2).toUpperCase()
    }

    return '??'
}

/**
 * Generate consistent color for avatar based on name
 * @param name - Name or username to generate color from
 * @returns Hex color code
 */
export function getAvatarColor(name: string): string {
    const colors = [
        '#8b5cf6', // violet-600
        '#a855f7', // purple-600
        '#2563eb', // blue-600
        '#0891b2', // cyan-600
        '#0d9488', // teal-600
        '#059669', // emerald-600
        '#16a34a', // green-600
        '#ea580c', // orange-600
        '#ec4899', // pink-600
        '#f43f5e', // rose-600
    ]

    // Simple hash function
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
}

/**
 * Get greeting based on time of day
 * @param hour - Current hour (0-23)
 * @param name - User's name (optional)
 * @returns Greeting message with emoji
 */
export function getGreeting(hour: number, name?: string | null): { message: string; emoji: string } {
    const displayName = name || 'Usuario'

    if (hour >= 5 && hour < 12) {
        return {
            message: `Buenos días, ${displayName}`,
            emoji: '☀️'
        }
    } else if (hour >= 12 && hour < 19) {
        return {
            message: `Buenas tardes, ${displayName}`,
            emoji: '🌤️'
        }
    } else {
        return {
            message: `Buenas noches, ${displayName}`,
            emoji: '🌙'
        }
    }
}
