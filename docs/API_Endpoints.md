# API Endpoints - ExDev Postulations Manager

API REST para gestionar postulaciones, votaciones y usuarios del Club ExDev. Diseñada para implementarse con [Hono.dev](https://hono.dev) y desplegarse en Cloudflare Workers.

## Base URL

```
{{host}}/v1
```

## Autenticación

Todos los endpoints (excepto los de autenticación) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

---

## 🔐 Autenticación

### Iniciar autenticación con Google

Genera la URL de autenticación de Google OAuth.

```http
GET {{host}}/v1/auth
```

**Query Parameters:**
- `method=google` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
}
```

**Status Codes:**
- `200` - URL generada exitosamente
- `400` - Parámetros inválidos
- `500` - Error del servidor

---

### Callback de autenticación Google

Procesa el callback de Google OAuth y genera tokens de sesión.

```http
GET {{host}}/v1/auth/callback
```

**Query Parameters:**
- `method=google` (required)
- `code` (required) - Código de autorización de Google
- `state` (optional) - Estado para validación CSRF

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "uid": "firebase-uid-123",
      "email": "usuario@exdev.cl",
      "displayName": "Juan Pérez",
      "photoURL": "https://...",
      "permissions": []
    }
  }
}
```

**Status Codes:**
- `200` - Autenticación exitosa
- `400` - Código inválido o expirado
- `401` - Autenticación fallida
- `500` - Error del servidor

---

### Refrescar token

Genera un nuevo token usando el refresh token.

```http
POST {{host}}/v1/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

**Status Codes:**
- `200` - Token refrescado exitosamente
- `401` - Refresh token inválido o expirado
- `500` - Error del servidor

---

### Cerrar sesión

Invalida el token actual y el refresh token.

```http
POST {{host}}/v1/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Status Codes:**
- `200` - Sesión cerrada exitosamente
- `401` - Token inválido o expirado
- `500` - Error del servidor

---

### Verificar token

Valida el token actual y retorna información del usuario.

```http
GET {{host}}/v1/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "uid": "firebase-uid-123",
      "email": "usuario@exdev.cl",
      "displayName": "Juan Pérez",
      "permissions": ["applications.view", "applications.vote.create"]
    }
  }
}
```

**Status Codes:**
- `200` - Token válido
- `401` - Token inválido o expirado
- `500` - Error del servidor

---

## 📋 Postulaciones (Applications)

### Listar todas las postulaciones

Obtiene todas las postulaciones con paginación opcional.

```http
GET {{host}}/v1/applications
```

**Query Parameters:**
- `page` (optional, default: 1) - Número de página
- `limit` (optional, default: 50) - Cantidad por página
- `sort` (optional, default: "created_at") - Campo para ordenar (created_at, nombre_completo, edad)
- `order` (optional, default: "desc") - Orden (asc, desc)

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "postulaciones": [
      {
        "id": 1,
        "nombre_completo": "Juan Pérez García",
        "rut": "12345678-9",
        "edad": 20,
        "correo_institucional": "juan.perez@utem.cl",
        "campus": "Campus Santiago Centro",
        "carrera": "Ingeniería Civil en Computación",
        "anio_ingreso": 2022,
        "anio_actual": 3,
        "area_interes1": "Backend",
        "area_interes2": "Cloud Computing",
        "area_interes3": null,
        "ayudantias": "Estructura de Datos, Algoritmos",
        "horas_disponibles_semanales": 15,
        "motivo_postulacion": "Quiero desarrollar mis habilidades...",
        "proyecto_idea": "Sistema de gestión de inventario",
        "portafolio": "https://github.com/juanperez",
        "postulacion_conjunta": null,
        "pitch": "Desarrollador apasionado por crear soluciones eficientes",
        "apodo": "JP",
        "created_at": "2025-11-10T12:30:00Z",
        "updated_at": "2025-11-10T12:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**
- `200` - Listado exitoso
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor

---

### Obtener una postulación específica

Obtiene los detalles completos de una postulación por su RUT.

```http
GET {{host}}/v1/applications/:rut
```

**Path Parameters:**
- `rut` (required) - RUT del postulante (ej: 12345678-9)

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "rut": "12345678-9",
    "edad": 20,
    "correo_institucional": "juan.perez@utem.cl",
    "campus": "Campus Santiago Centro",
    "carrera": "Ingeniería Civil en Computación",
    "anio_ingreso": 2022,
    "anio_actual": 3,
    "area_interes1": "Backend",
    "area_interes2": "Cloud Computing",
    "area_interes3": null,
    "ayudantias": "Estructura de Datos, Algoritmos",
    "horas_disponibles_semanales": 15,
    "motivo_postulacion": "Quiero desarrollar mis habilidades en backend y cloud...",
    "proyecto_idea": "Sistema de gestión de inventario con microservicios",
    "portafolio": "https://github.com/juanperez",
    "postulacion_conjunta": null,
    "pitch": "Desarrollador apasionado por crear soluciones eficientes",
    "apodo": "JP",
    "created_at": "2025-11-10T12:30:00Z",
    "updated_at": "2025-11-10T12:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Postulación encontrada
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Crear una postulación

Crea una nueva postulación (endpoint público para formulario externo).

```http
POST {{host}}/v1/applications
```

**Request Body:**
```json
{
  "nombre_completo": "Juan Pérez García",
  "rut": "12345678-9",
  "edad": 20,
  "correo_institucional": "juan.perez@utem.cl",
  "campus": "Campus Santiago Centro",
  "carrera": "Ingeniería Civil en Computación",
  "anio_ingreso": 2022,
  "anio_actual": 3,
  "area_interes1": "Backend",
  "area_interes2": "Cloud Computing",
  "area_interes3": null,
  "ayudantias": "Estructura de Datos, Algoritmos",
  "horas_disponibles_semanales": 15,
  "motivo_postulacion": "Quiero desarrollar mis habilidades...",
  "proyecto_idea": "Sistema de gestión de inventario",
  "portafolio": "https://github.com/juanperez",
  "postulacion_conjunta": null,
  "pitch": "Desarrollador apasionado",
  "apodo": "JP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rut": "12345678-9",
    "created_at": "2025-11-10T12:30:00Z",
    "message": "Postulación creada exitosamente"
  }
}
```

**Status Codes:**
- `201` - Postulación creada exitosamente
- `400` - Datos inválidos o incompletos
- `409` - RUT ya existe
- `500` - Error del servidor

---

### Actualizar una postulación

Actualiza los datos de una postulación existente.

```http
PUT {{host}}/v1/applications/:rut
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.edit`

**Request Body:** (todos los campos son opcionales)
```json
{
  "nombre_completo": "Juan Pérez García",
  "edad": 21,
  "campus": "Campus Providencia",
  "horas_disponibles_semanales": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rut": "12345678-9",
    "updated_at": "2025-11-15T10:00:00Z",
    "message": "Postulación actualizada exitosamente"
  }
}
```

**Status Codes:**
- `200` - Actualización exitosa
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Eliminar una postulación

Elimina una postulación y todos sus votos asociados.

```http
DELETE {{host}}/v1/applications/:rut
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.delete`

**Response:**
```json
{
  "success": true,
  "message": "Postulación eliminada exitosamente"
}
```

**Status Codes:**
- `200` - Eliminación exitosa
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Sincronizar postulaciones

Sincroniza postulaciones desde una fuente externa a la base de datos.

```http
POST {{host}}/v1/applications/sync
```

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.sync`

**Request Body:** (opcional, si se omite sincroniza desde fuente configurada)
```json
{
  "source": "external_api",
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 25,
    "updated": 3,
    "failed": 0,
    "total": 25,
    "timestamp": "2025-11-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Sincronización exitosa
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor
- `503` - Fuente externa no disponible

---

## 🗳️ Votaciones (Votes)

### Crear/Actualizar un voto

Crea o actualiza el voto de un usuario para una postulación específica.

```http
POST {{host}}/v1/applications/:rut/votes
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.vote.create`

**Request Body:**
```json
{
  "vote": "aprobar",
  "justification": "Excelente perfil técnico, demuestra gran motivación y tiene experiencia relevante en backend."
}
```

**Fields:**
- `vote` - "aprobar" o "rechazar"
- `justification` - Texto obligatorio justificando el voto (min 20 caracteres)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-uid-123",
    "userName": "María González",
    "userEmail": "maria.gonzalez@exdev.cl",
    "applicationRut": "12345678-9",
    "vote": "aprobar",
    "justification": "Excelente perfil técnico...",
    "timestamp": "2025-11-15T14:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Voto actualizado exitosamente
- `201` - Voto creado exitosamente
- `400` - Datos inválidos o justificación insuficiente
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Obtener votos de una postulación

Obtiene todos los votos de una postulación específica.

```http
GET {{host}}/v1/applications/:rut/votes
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.vote.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationRut": "12345678-9",
    "summary": {
      "totalVotes": 10,
      "aprobar": 7,
      "rechazar": 3,
      "percentage": {
        "aprobar": 70,
        "rechazar": 30
      }
    },
    "votes": [
      {
        "userId": "firebase-uid-123",
        "userName": "María González",
        "userEmail": "maria.gonzalez@exdev.cl",
        "applicationRut": "12345678-9",
        "vote": "aprobar",
        "justification": "Excelente perfil técnico...",
        "timestamp": "2025-11-15T14:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Votos obtenidos exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Obtener mi voto para una postulación

Obtiene el voto del usuario autenticado para una postulación específica.

```http
GET {{host}}/v1/applications/:rut/votes/me
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.vote.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "vote": {
      "userId": "firebase-uid-123",
      "userName": "María González",
      "userEmail": "maria.gonzalez@exdev.cl",
      "applicationRut": "12345678-9",
      "vote": "aprobar",
      "justification": "Excelente perfil técnico...",
      "timestamp": "2025-11-15T14:30:00Z"
    }
  }
}
```

**Response (sin voto):**
```json
{
  "success": true,
  "data": {
    "hasVoted": false,
    "vote": null
  }
}
```

**Status Codes:**
- `200` - Consulta exitosa
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Postulación no encontrada
- `500` - Error del servidor

---

### Eliminar mi voto

Elimina el voto del usuario autenticado para una postulación específica.

```http
DELETE {{host}}/v1/applications/:rut/votes/me
```

**Path Parameters:**
- `rut` (required) - RUT del postulante

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.vote.delete`

**Response:**
```json
{
  "success": true,
  "message": "Voto eliminado exitosamente"
}
```

**Status Codes:**
- `200` - Voto eliminado exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Voto no encontrado
- `500` - Error del servidor

---

### Obtener resumen de todas las votaciones

Obtiene un resumen consolidado de votos de todas las postulaciones.

```http
GET {{host}}/v1/votes/summary
```

**Query Parameters:**
- `sort` (optional, default: "totalVotes") - Campo para ordenar (totalVotes, aprobar, rechazar)
- `order` (optional, default: "desc") - Orden (asc, desc)
- `limit` (optional) - Limitar cantidad de resultados

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.vote.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "totalVotes": 150,
    "summaries": [
      {
        "applicationRut": "12345678-9",
        "nombre_completo": "Juan Pérez García",
        "totalVotes": 10,
        "aprobar": 7,
        "rechazar": 3,
        "percentage": {
          "aprobar": 70,
          "rechazar": 30
        }
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Resumen obtenido exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor

---

## 👥 Usuarios (Users)

### Listar todos los usuarios

Obtiene la lista de todos los usuarios registrados.

```http
GET {{host}}/v1/users
```

**Query Parameters:**
- `page` (optional, default: 1) - Número de página
- `limit` (optional, default: 50) - Cantidad por página

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "uid": "firebase-uid-123",
        "email": "usuario@exdev.cl",
        "displayName": "María González",
        "photoURL": "https://...",
        "permissions": [
          "applications.view",
          "applications.vote.create",
          "applications.vote.view"
        ],
        "createdAt": "2025-11-01T10:00:00Z",
        "lastLogin": "2025-11-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**
- `200` - Listado exitoso
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor

---

### Obtener un usuario específico

Obtiene los detalles de un usuario por su UID.

```http
GET {{host}}/v1/users/:uid
```

**Path Parameters:**
- `uid` (required) - UID del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "email": "usuario@exdev.cl",
    "displayName": "María González",
    "photoURL": "https://...",
    "permissions": [
      "applications.view",
      "applications.vote.create",
      "applications.vote.view"
    ],
    "createdAt": "2025-11-01T10:00:00Z",
    "lastLogin": "2025-11-15T09:00:00Z",
    "votesCount": 15
  }
}
```

**Status Codes:**
- `200` - Usuario encontrado
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

### Obtener perfil del usuario actual

Obtiene el perfil del usuario autenticado.

```http
GET {{host}}/v1/users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "email": "usuario@exdev.cl",
    "displayName": "María González",
    "photoURL": "https://...",
    "permissions": [
      "applications.view",
      "applications.vote.create"
    ],
    "createdAt": "2025-11-01T10:00:00Z",
    "lastLogin": "2025-11-15T09:00:00Z",
    "votesCount": 15
  }
}
```

**Status Codes:**
- `200` - Perfil obtenido exitosamente
- `401` - No autenticado
- `500` - Error del servidor

---

### Agregar permiso a un usuario

Agrega un nuevo permiso a un usuario.

```http
POST {{host}}/v1/users/:uid/permissions
```

**Path Parameters:**
- `uid` (required) - UID del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.permissions.manage`

**Request Body:**
```json
{
  "permission": "applications.vote.create"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "permissions": [
      "applications.view",
      "applications.vote.create",
      "applications.vote.view"
    ]
  }
}
```

**Status Codes:**
- `200` - Permiso agregado exitosamente
- `400` - Permiso inválido o ya existe
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

### Eliminar permiso de un usuario

Elimina un permiso de un usuario.

```http
DELETE {{host}}/v1/users/:uid/permissions/:permission
```

**Path Parameters:**
- `uid` (required) - UID del usuario
- `permission` (required) - Nombre del permiso a eliminar

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.permissions.manage`

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "permissions": [
      "applications.view",
      "applications.vote.view"
    ]
  }
}
```

**Status Codes:**
- `200` - Permiso eliminado exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Usuario o permiso no encontrado
- `500` - Error del servidor

---

### Obtener votos de un usuario

Obtiene todos los votos emitidos por un usuario específico.

```http
GET {{host}}/v1/users/:uid/votes
```

**Path Parameters:**
- `uid` (required) - UID del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.view` o el usuario debe ser el mismo (uid coincide)

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "votesCount": 15,
    "votes": [
      {
        "applicationRut": "12345678-9",
        "nombre_completo": "Juan Pérez García",
        "vote": "aprobar",
        "justification": "Excelente perfil técnico...",
        "timestamp": "2025-11-15T14:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Votos obtenidos exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

### Eliminar un usuario

Elimina un usuario y todos sus votos asociados.

```http
DELETE {{host}}/v1/users/:uid
```

**Path Parameters:**
- `uid` (required) - UID del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `users.delete`

**Response:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Status Codes:**
- `200` - Usuario eliminado exitosamente
- `400` - No se puede eliminar el usuario actual
- `401` - No autenticado
- `403` - Sin permisos
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

## 📊 Estadísticas y Reportes

### Obtener estadísticas generales

Obtiene estadísticas generales del sistema.

```http
GET {{host}}/v1/stats
```

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `stats.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": {
      "total": 25,
      "withVotes": 20,
      "withoutVotes": 5
    },
    "votes": {
      "total": 150,
      "aprobar": 95,
      "rechazar": 55,
      "averagePerApplication": 6
    },
    "users": {
      "total": 15,
      "withPermissions": 12,
      "activeVoters": 10
    },
    "topVoters": [
      {
        "uid": "firebase-uid-123",
        "displayName": "María González",
        "votesCount": 20
      }
    ],
    "topApplications": [
      {
        "rut": "12345678-9",
        "nombre_completo": "Juan Pérez García",
        "totalVotes": 12,
        "aprobar": 10,
        "rechazar": 2
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Estadísticas obtenidas exitosamente
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor

---

## 🔍 Búsqueda

### Buscar postulaciones

Busca postulaciones por diferentes criterios.

```http
GET {{host}}/v1/search/applications
```

**Query Parameters:**
- `q` (required) - Término de búsqueda
- `fields` (optional) - Campos donde buscar: nombre_completo, rut, carrera, area_interes1, area_interes2, area_interes3 (separados por coma)
- `page` (optional, default: 1) - Número de página
- `limit` (optional, default: 20) - Cantidad por página

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions Required:** `applications.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "nombre_completo": "Juan Pérez García",
        "rut": "12345678-9",
        "carrera": "Ingeniería Civil en Computación",
        "area_interes1": "Backend",
        "relevance": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**
- `200` - Búsqueda exitosa
- `400` - Parámetros inválidos
- `401` - No autenticado
- `403` - Sin permisos
- `500` - Error del servidor

---

## ❌ Formato de Errores

Todos los endpoints retornan errores en el siguiente formato:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {
      "field": "Información adicional"
    }
  }
}
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `UNAUTHORIZED` | Token no proporcionado o inválido |
| `FORBIDDEN` | Usuario sin permisos suficientes |
| `NOT_FOUND` | Recurso no encontrado |
| `VALIDATION_ERROR` | Datos de entrada inválidos |
| `DUPLICATE_ENTRY` | Recurso ya existe |
| `INTERNAL_ERROR` | Error interno del servidor |
| `SERVICE_UNAVAILABLE` | Servicio temporal no disponible |

---

## 🔐 Sistema de Permisos

### Permisos Disponibles

| Permiso | Descripción |
|---------|-------------|
| `applications.view` | Ver postulaciones |
| `applications.edit` | Editar postulaciones |
| `applications.delete` | Eliminar postulaciones |
| `applications.sync` | Sincronizar postulaciones |
| `applications.vote.create` | Crear/actualizar votos |
| `applications.vote.view` | Ver resultados de votaciones |
| `applications.vote.delete` | Eliminar votos propios |
| `users.view` | Ver lista de usuarios |
| `users.permissions.manage` | Gestionar permisos de usuarios |
| `users.delete` | Eliminar usuarios |
| `stats.view` | Ver estadísticas del sistema |

---

## 📝 Notas de Implementación

### Consideraciones para Cloudflare Workers

1. **Variables de Entorno**:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

2. **Límites de Cloudflare Workers**:
   - CPU Time: 50ms por request (plan gratuito)
   - Request size: 100MB
   - Response size: sin límite
   - Subrequests: 50 por request

3. **Middleware Recomendado**:
   - Rate limiting por IP y usuario
   - CORS configurado apropiadamente
   - Validación de entrada con Zod
   - Logging de requests importantes

4. **Caché**:
   - Implementar caché de permisos de usuario (5 minutos)
   - Caché de listados de postulaciones (1 minuto)
   - Invalidar caché en actualizaciones

5. **Seguridad**:
   - Validar todos los inputs
   - Sanitizar datos antes de guardar
   - Implementar CSRF protection
   - Rate limiting agresivo en endpoints de autenticación

---

## 🚀 Próximos Pasos

1. Implementar API con Hono.dev
2. Configurar Firebase Admin SDK en Cloudflare Workers
3. Implementar autenticación JWT
4. Crear middleware de autorización basado en permisos
5. Implementar endpoints según esta documentación
6. Agregar tests unitarios y de integración
7. Configurar CI/CD para deployment automático
8. Implementar monitoring y alertas
