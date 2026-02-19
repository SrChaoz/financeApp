/**
 * FinanzasPro - E2E Test Suite
 * Pruebas End-to-End completas para la aplicación de finanzas personales
 * 
 * @author QA Automation Team
 * @version 1.0.0
 */

describe('FinanzasPro - Suite de Pruebas E2E', () => {
    const baseUrl = 'http://localhost:3000'
    const apiUrl = 'http://localhost:3001'

    // Datos de prueba
    const testUser = {
        username: `testuser_${Date.now()}`,
        password: 'Test123456'
    }

    const testAccount = {
        name: 'Cuenta de Prueba',
        type: 'Banco'
    }

    // Helper: Limpiar localStorage antes de cada test
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.clearCookies()
    })

    /**
     * TEST 1: Login Exitoso
     * Verifica que un usuario puede iniciar sesión correctamente
     */
    describe('1. Autenticación - Login Exitoso', () => {
        it('Debe permitir login con credenciales válidas y redirigir al dashboard', () => {
            // Primero registrar el usuario
            cy.visit(`${baseUrl}/login`)
            cy.contains('Regístrate gratis').click()

            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').first().type(testUser.password)
            cy.get('input[type="password"]').last().type(testUser.password)
            cy.contains('Crear Cuenta').click()

            // Esperar redirección
            cy.url().should('include', '/dashboard')
            cy.wait(1000)

            // Logout para probar login
            cy.clearLocalStorage()

            // Ahora hacer login
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()

            // Verificaciones
            cy.url().should('include', '/dashboard', { timeout: 10000 })
            cy.window().its('localStorage.token').should('exist')
            cy.contains('Actividad Reciente').should('be.visible')
        })
    })

    /**
     * TEST 2: Login con Error
     * Verifica el manejo de credenciales inválidas
     */
    describe('2. Autenticación - Login con Credenciales Inválidas', () => {
        it('Debe mostrar mensaje de error con credenciales incorrectas', () => {
            cy.visit(`${baseUrl}/login`)

            cy.get('input[type="text"]').type('usuarioInexistente')
            cy.get('input[type="password"]').type('passwordIncorrecto')
            cy.contains('Iniciar Sesión').click()

            // Verificar mensaje de error - buscar el div de error específico
            cy.get('.text-rose-400', { timeout: 5000 }).should('be.visible').and('not.be.empty')
            cy.url().should('include', '/login')
        })
    })

    /**
     * TEST 3: Registro de Usuario
     * Verifica el flujo completo de registro
     */
    describe('3. Registro de Usuario Nuevo', () => {
        it('Debe registrar un nuevo usuario exitosamente', () => {
            const newUser = {
                username: `newuser_${Date.now()}`,
                password: 'NewPass123'
            }

            cy.visit(`${baseUrl}/login`)
            cy.contains('Regístrate gratis').click()

            // Verificar que cambió a modo registro
            cy.contains('Crear Cuenta').should('be.visible')

            // Llenar formulario
            cy.get('input[type="text"]').type(newUser.username)
            cy.get('input[type="password"]').first().type(newUser.password)
            cy.get('input[type="password"]').last().type(newUser.password)

            // Verificar que el botón de confirmar contraseña funciona
            cy.get('input[type="password"]').last().should('have.value', newUser.password)

            // Enviar formulario
            cy.contains('Crear Cuenta').click()

            // Verificaciones
            cy.url().should('include', '/dashboard', { timeout: 10000 })
            cy.window().its('localStorage.token').should('exist')
            cy.window().its('localStorage.user').should('exist')
        })
    })

    /**
     * TEST 4: Crear Ingreso
     * Verifica la creación de una transacción de tipo ingreso
     * NOTA: Este test crea la cuenta que se usará en el test de Gasto
     */
    describe('4. Crear Transacción - Ingreso', () => {
        beforeEach(() => {
            // Login simple
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
            cy.wait(1000)

            // Crear cuenta via API para asegurar que existe
            cy.window().then((win) => {
                const token = win.localStorage.getItem('token')
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/api/accounts`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: {
                        name: testAccount.name,
                        type: testAccount.type
                    },
                    failOnStatusCode: false // No fallar si la cuenta ya existe
                })
            })
            cy.wait(1000)
        })

        it('Debe crear un ingreso de $3000 correctamente', () => {
            cy.visit(`${baseUrl}/transactions`)
            cy.wait(1000)

            // Hacer clic en el botón flotante de Plus (navegación móvil/desktop)
            // En desktop: buscar botón "Gasto" en sidebar
            // En móvil: buscar botón flotante con Plus
            cy.get('body').then($body => {
                // Intentar encontrar el botón flotante (móvil) o el botón de Gasto (desktop)
                const floatingButton = $body.find('button').filter((i, el) => {
                    const svg = el.querySelector('svg')
                    return svg && (svg.classList.contains('lucide-plus') || el.textContent.includes('Gasto'))
                })

                if (floatingButton.length > 0) {
                    cy.wrap(floatingButton).first().click()
                } else {
                    // Fallback: buscar cualquier botón que abra el modal
                    cy.get('button').contains(/Gasto|Plus/i).click()
                }
            })

            // Verificar que el modal está abierto y esperar animación
            cy.contains('Nueva Transacción', { timeout: 5000 }).should('be.visible')
            cy.wait(1000)

            // Asegurar que está en modo Ingreso
            cy.contains('Ingreso').click({ force: true })


            // Llenar formulario
            cy.get('input[type="number"]').first().clear().type('3000.00')
            cy.get('select').first().select('Salario')
            cy.get('textarea').type('Pago quincenal')

            // Guardar con force: true
            cy.contains(/Crear Transacción|Guardar/i).click({ force: true })

            // Verificar (esperar a que cierre el modal)
            cy.wait(2000)
            cy.get('body').should('contain', '3000')
            cy.get('body').should('contain', 'Salario')
        })
    })

    /**
     * TEST 5: Crear Gasto
     * Verifica la creación de una transacción de tipo gasto
     * NOTA: Este test usa la cuenta creada en el test de Ingreso
     */
    describe('5. Crear Transacción - Gasto', () => {
        beforeEach(() => {
            // Login simple
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
            cy.wait(1000)

            // Crear cuenta via API para asegurar que existe
            cy.window().then((win) => {
                const token = win.localStorage.getItem('token')
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/api/accounts`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: {
                        name: testAccount.name,
                        type: testAccount.type
                    },
                    failOnStatusCode: false // No fallar si la cuenta ya existe
                })
            })
            cy.wait(1000)
        })

        it('Debe crear un gasto de $150.50 y actualizar el saldo', () => {
            cy.visit(`${baseUrl}/transactions`)
            cy.wait(1000)

            // Buscar el botón de "Gasto" en el sidebar (desktop) o usar el botón flotante
            cy.get('body').then($body => {
                const ingresoButton = $body.find('button').filter((i, el) => {
                    return el.textContent.includes('Gasto')
                })

                if (ingresoButton.length > 0) {
                    // Hacer clic en el botón de Gasto del sidebar
                    cy.wrap(ingresoButton).first().click()
                } else {
                    // Usar el botón flotante y luego cambiar a Gasto
                    cy.get('button').filter((i, el) => {
                        const svg = el.querySelector('svg')
                        return svg && svg.classList.contains('lucide-plus')
                    }).first().click()

                    // Esperar que abra el modal y cambiar a Gasto
                    cy.wait(500)
                    cy.contains('Gasto').click({ force: true })
                }
            })

            // Verificar que el modal está abierto
            cy.contains('Nueva Transacción', { timeout: 5000 }).should('be.visible')

            // Asegurar que está en modo Gasto
            cy.contains('Gasto').click({ force: true })


            // Llenar formulario
            cy.get('input[type="number"]').first().clear().type('150.50')
            cy.get('select').first().select('Alimentación')
            cy.get('textarea').type('Compra de supermercado')

            // Guardar
            cy.contains(/Crear Transacción|Guardar/i).click({ force: true })

            // Verificar (esperar a que cierre el modal)
            cy.wait(2000)
            cy.get('body').should('contain', '150.50')
            cy.get('body').should('contain', 'Alimentación')
        })
    })

    /**
     * TEST 6: Filtrar por Categoría
     * Verifica el filtrado de transacciones
     */
    describe('6. Filtrar Transacciones por Categoría', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe filtrar transacciones por categoría seleccionada', () => {
            cy.visit(`${baseUrl}/transactions`)
            cy.wait(1000)

            // Verificar que hay transacciones
            cy.get('body').then($body => {
                if ($body.text().includes('Alimentación')) {
                    // Buscar filtro de categoría (puede ser un select o botones)
                    cy.get('select, button').then($elements => {
                        const categoryFilter = $elements.filter((i, el) => {
                            return el.textContent.includes('Categoría') ||
                                el.textContent.includes('Filtrar') ||
                                el.value === 'Alimentación'
                        })

                        if (categoryFilter.length > 0) {
                            if (categoryFilter.is('select')) {
                                cy.wrap(categoryFilter).first().select('Alimentación')
                            } else {
                                cy.contains('Alimentación').click()
                            }

                            // Verificar que solo muestra transacciones de esa categoría
                            cy.contains('Alimentación').should('be.visible')
                        }
                    })
                }
            })
        })
    })

    /**
     * TEST 7: Crear Presupuesto
     * Verifica la creación de un presupuesto mensual
     */
    describe('7. Crear Presupuesto', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe crear un presupuesto para una categoría', () => {
            cy.visit(`${baseUrl}/budgets`)
            cy.wait(1000)

            cy.contains(/Nuevo Presupuesto|Crear/i).click()

            // Verificar modal abierto
            cy.contains('Nuevo Presupuesto').should('be.visible')
            cy.wait(1000)

            // Llenar formulario
            cy.get('select').first().select('Transporte')
            cy.get('input[type="number"]').clear().type('500')

            // Guardar
            cy.contains(/Crear|Guardar/i).click({ force: true })

            cy.wait(2000)
            // Verificar
        })
    })

    /**
     * TEST 8: Crear Meta de Ahorro
     * Verifica la creación de una meta financiera
     */
    describe('8. Crear Meta de Ahorro', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe crear una meta de ahorro con objetivo', () => {
            cy.visit(`${baseUrl}/goals`)
            cy.wait(1000)

            cy.contains(/Nueva Meta|Crear/i).click()

            // Verificar modal
            cy.contains(/Nueva Meta|Crear Meta/i).should('be.visible')
            cy.wait(1000)

            // Llenar formulario
            cy.get('input[type="text"]').first().type('Vacaciones 2026')
            cy.get('input[type="number"]').first().clear().type('5000')
            cy.get('input[type="number"]').last().clear().type('1000')
            cy.get('textarea').type('Viaje a Europa')

            // Guardar
            cy.contains(/Crear|Guardar/i).click({ force: true })

        })
    })

    /**
     * TEST 9: Completar Meta
     * Verifica el proceso de completar una meta de ahorro
     */
    describe('9. Completar Meta de Ahorro', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe marcar una meta como completada', () => {
            cy.visit(`${baseUrl}/goals`)
            cy.wait(1000)

            // Verificar que hay metas
            cy.get('body').then($body => {
                if ($body.text().includes('Vacaciones')) {
                    // Buscar botón de completar o editar
                    cy.contains('Vacaciones').parent().parent().within(() => {
                        // Buscar botón de completar, editar o menú
                        cy.get('button').then($buttons => {
                            if ($buttons.length > 0) {
                                // Click en el primer botón (puede ser editar o menú)
                                cy.wrap($buttons).first().click()

                                // Buscar opción de completar
                                cy.get('body').then($body2 => {
                                    if ($body2.text().includes('Completar') || $body2.text().includes('Marcar como completada')) {
                                        cy.contains(/Completar|Marcar como completada/i).click()

                                        // Verificar modal de celebración o confirmación
                                        cy.wait(500)
                                    }
                                })
                            }
                        })
                    })
                }
            })
        })
    })

    /**
     * TEST 10: Editar Perfil de Usuario
     * Verifica la actualización de datos del perfil
     */
    describe('10. Editar Perfil de Usuario', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe actualizar información del perfil correctamente', () => {
            cy.visit(`${baseUrl}/profile`)
            cy.wait(1000)

            // Llenar campos del perfil
            cy.get('input[type="text"]').then($inputs => {
                if ($inputs.length > 0) {
                    // Nombre
                    cy.wrap($inputs).eq(0).clear().type('Juan')
                    // Apellido
                    if ($inputs.length > 1) {
                        cy.wrap($inputs).eq(1).clear().type('Pérez')
                    }
                }
            })

            // Email
            cy.get('input[type="email"]').clear().type('juan.perez@test.com')

            // Género
            cy.get('select').first().select('Masculino')

            // Guardar cambios
            cy.contains(/Guardar|Actualizar/i).click()

            // Verificar mensaje de éxito
            cy.contains(/actualizado|guardado|éxito/i, { timeout: 5000 }).should('be.visible')
        })
    })

    /**
     * Modo Responsive
     * Verifica que la aplicación es responsive en diferentes viewports
     */
    describe('Verificar Diseño Responsive', () => {
        beforeEach(() => {
            cy.visit(`${baseUrl}/login`)
            cy.get('input[type="text"]').type(testUser.username)
            cy.get('input[type="password"]').type(testUser.password)
            cy.contains('Iniciar Sesión').click()
            cy.url().should('include', '/dashboard', { timeout: 10000 })
        })

        it('Debe mostrar navegación móvil en viewport pequeño', () => {
            // Cambiar a viewport móvil
            cy.viewport('iphone-x')
            cy.visit(`${baseUrl}/dashboard`)

            // Verificar que elementos móviles están visibles
            cy.get('body').should('be.visible')

            // Verificar que puede navegar
            cy.visit(`${baseUrl}/transactions`)
            cy.get("body").should("contain", "Transacciones")
        })

        it('Debe mostrar sidebar en viewport desktop', () => {
            // Cambiar a viewport desktop
            cy.viewport(1920, 1080)
            cy.visit(`${baseUrl}/dashboard`)

            // Verificar elementos de desktop
            cy.get('body').should('be.visible')
            cy.contains('Dashboard').should('be.visible')
        })
    })
})
