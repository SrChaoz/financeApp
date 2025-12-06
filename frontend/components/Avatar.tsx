import { getInitials, getAvatarColor } from '@/lib/avatarUtils'

interface AvatarProps {
    firstName?: string | null
    lastName?: string | null
    username?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
}

export default function Avatar({
    firstName,
    lastName,
    username = 'User',
    size = 'md',
    className = ''
}: AvatarProps) {
    const initials = getInitials(firstName, lastName, username)
    // Use first available non-empty value for color generation
    const nameForColor = (firstName && firstName.trim()) || (lastName && lastName.trim()) || username
    const backgroundColor = getAvatarColor(nameForColor)

    return (
        <div
            className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
            style={{ backgroundColor }}
            title={firstName && lastName ? `${firstName} ${lastName}` : username}
        >
            {initials}
        </div>
    )
}
