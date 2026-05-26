# API Spec — OpenAPI 3.0 (Spec-Driven Design)

Este directorio contiene la especificación OpenAPI 3.0.3 del sistema **Banco Core**. Es el punto de partida del desarrollo (Spec-Driven Design): primero se define el contrato de la API, luego se implementa.

## Archivo

```
openapi.yaml    # Especificación OpenAPI completa (972 líneas)
```

## ¿Qué es Spec-Driven Design?

SDD es un enfoque donde la especificación de la API se escribe **antes** del código. Esto garantiza:

1. **Contrato claro** entre frontend y backend
2. **Documentación viva** que siempre refleja el estado real
3. **Desarrollo en paralelo** — frontend y backend pueden avanzar contra el mismo spec
4. **Validación temprana** del diseño de la API antes de escribir código

## Estructura de la especificación

```
openapi.yaml
├── info                  # Metadatos: título, versión, contacto
├── servers               # URL base: http://localhost:3000/api/v1
├── components
│   ├── securitySchemes   # Bearer JWT
│   └── schemas           # 14 schemas de datos + DTOs
│       ├── RolSistema
│       ├── EstadoGeneral
│       ├── ClientePersona / CreateClientePersonaDTO
│       ├── ClienteEmpresa / CreateClienteEmpresaDTO
│       ├── UsuarioSistema
│       ├── CuentaBancaria
│       ├── Prestamo
│       ├── Transferencia
│       ├── BitacoraOperacion
│       ├── ProductoBancario / CreateProductoDTO
│       ├── DashboardStats
│       └── Error
└── paths                 # 22 endpoints agrupados en 9 tags
    ├── /auth/login
    ├── /dashboard
    ├── /clientes/persona
    ├── /clientes/empresa
    ├── /usuarios
    ├── /cuentas
    ├── /prestamos
    ├── /transferencias
    ├── /bitacora
    ├── /productos
    ├── /roles
    └── /estados
```

## Endpoints

### Autenticación
| Path | Método | Descripción |
|------|--------|-------------|
| `/auth/login` | POST | Iniciar sesión (público) |

### Dashboard
| Path | Método | Descripción |
|------|--------|-------------|
| `/dashboard` | GET | Estadísticas del sistema |

### Clientes Persona
| Path | Método | Descripción |
|------|--------|-------------|
| `/clientes/persona` | GET | Listar todos |
| `/clientes/persona` | POST | Crear nuevo |
| `/clientes/persona/{id}` | GET | Obtener por ID |

### Clientes Empresa
| Path | Método | Descripción |
|------|--------|-------------|
| `/clientes/empresa` | GET | Listar todos |
| `/clientes/empresa` | POST | Crear nuevo |
| `/clientes/empresa/{id}` | GET | Obtener por ID |

### Usuarios
| Path | Método | Descripción |
|------|--------|-------------|
| `/usuarios` | GET | Listar todos |
| `/usuarios` | POST | Crear nuevo |
| `/usuarios/{id}` | GET | Obtener por ID |

### Cuentas
| Path | Método | Descripción |
|------|--------|-------------|
| `/cuentas` | GET | Listar (filtro: titular_id, tipo_titular) |
| `/cuentas` | POST | Crear nueva |
| `/cuentas/{numero_cuenta}` | GET | Obtener por número |

### Préstamos
| Path | Método | Descripción |
|------|--------|-------------|
| `/prestamos` | GET | Listar (filtro: id_cliente, estado) |
| `/prestamos` | POST | Solicitar nuevo |
| `/prestamos/{id}` | GET | Obtener por ID |
| `/prestamos/{id}/resolver` | PUT | Aprobar/rechazar |
| `/prestamos/{id}/desembolsar` | POST | Desembolsar |

### Transferencias
| Path | Método | Descripción |
|------|--------|-------------|
| `/transferencias` | GET | Listar (filtro: cuenta, estado) |
| `/transferencias` | POST | Crear nueva |
| `/transferencias/{id}` | GET | Obtener por ID |
| `/transferencias/{id}/resolver` | PUT | Aprobar/rechazar (empresarial) |
| `/transferencias/vencer` | POST | Vencer pendientes (+60 min) |

### Bitácora
| Path | Método | Descripción |
|------|--------|-------------|
| `/bitacora` | GET | Listar eventos (filtro: entidad, limit) |

### Productos
| Path | Método | Descripción |
|------|--------|-------------|
| `/productos` | GET | Listar productos |
| `/productos` | POST | Crear producto |

### Catálogos
| Path | Método | Descripción |
|------|--------|-------------|
| `/roles` | GET | Listar roles del sistema |
| `/estados` | GET | Listar estados por tipo |

## Schemas principales

| Schema | Descripción |
|--------|-------------|
| `ClientePersona` | Persona natural: identificación, nombre, correo, teléfono, fecha nacimiento, dirección |
| `ClienteEmpresa` | Empresa: NIT, razón social, representante legal |
| `UsuarioSistema` | Usuario unificado: rol, estado, tipo de relación (PERSONA/EMPRESA) |
| `CuentaBancaria` | Cuenta: tipo, titular, saldo, moneda, estado, producto |
| `Prestamo` | Préstamo completo con flujo de estados y montos |
| `Transferencia` | Transferencia con origen, destino, monto, aprobación |
| `BitacoraOperacion` | Auditoría: entidad, acción, usuario, fecha, detalle |
| `DashboardStats` | Estadísticas agregadas del sistema |

## Autenticación

Toda la API (excepto `/auth/login`) requiere autenticación mediante JWT Bearer Token:

```
Authorization: Bearer <token>
```

El token se obtiene de `POST /auth/login` y contiene:
```json
{
  "id_usuario": 1,
  "correo": "admin@banco.com",
  "rol": "ADMIN_SISTEMA"
}
```

## Uso con herramientas

### Swagger UI
```bash
# Instalar swagger-ui-express en el backend
npm install swagger-ui-express @types/swagger-ui-express

# Agregar ruta:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
```

### Postman
Importar el archivo `openapi.yaml` directamente:
1. Postman → Import → Upload Files → `api-spec/openapi.yaml`
2. Se crearán todas las colecciones y endpoints automáticamente
3. Configurar variable `{{baseUrl}} = http://localhost:3000/api/v1`
