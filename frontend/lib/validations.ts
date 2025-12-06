import { z } from 'zod'

// Account validation schema
export const accountSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    type: z.string().min(1, 'El tipo es requerido')
})

export type AccountFormData = z.infer<typeof accountSchema>

// Transaction validation schema
export const transactionSchema = z.object({
    amount: z.number().positive('El monto debe ser mayor a 0'),
    type: z.enum(['INCOME', 'EXPENSE'], {
        errorMap: () => ({ message: 'Tipo inválido' })
    }),
    date: z.string().min(1, 'La fecha es requerida'),
    category: z.string().min(1, 'La categoría es requerida'),
    notes: z.string().optional(),
    isRecurring: z.boolean(),
    accountId: z.string().min(1, 'La cuenta es requerida')
})

export type TransactionFormData = z.infer<typeof transactionSchema>

// Budget validation schema
export const budgetSchema = z.object({
    category: z.string().min(1, 'La categoría es requerida'),
    limitAmount: z.number().positive('El límite debe ser mayor a 0')
})

export type BudgetFormData = z.infer<typeof budgetSchema>

// Login validation schema
export const loginSchema = z.object({
    username: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>
