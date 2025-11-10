# 📋 ExDev - Dashboard de Gestión de Postulaciones

Dashboard web moderno para gestionar postulaciones al Club ExDev, permitiendo visualizar, votar y analizar candidatos de forma segura y eficiente.

## 🎯 Descripción General

**ExDev Postulations Manager** es una plataforma completa para:
- ✅ Visualizar y filtrar postulaciones
- ✅ Gestionar votaciones en tiempo real
- ✅ Analizar resultados con gráficos interactivos
- ✅ Control de acceso basado en permisos
- ✅ Sincronización de datos desde múltiples fuentes

---

## ✨ Características Principales

### 📱 Gestión de Postulaciones
- **Visualización de Candidatos**: Lista completa de postulantes con información detallada
- **Modal de Detalles**: Información completa del candidato incluyendo:
  - Datos personales y académicos
  - Áreas de interés
  - Proyecto/Idea propuesta
  - Portafolio (enlace externo)
  - Disponibilidad y motivación

### 🗳️ Sistema de Votación
- **Panel de Votación**: Interfaz intuitiva para emitir votos (Aprobar/Rechazar)
- **Justificación de Votos**: Obligatoria para mantener trazabilidad
- **Voto Único por Usuario**: Un usuario, un voto por candidato
- **Visualización de Votos Actuales**: Resumen en tiempo real de aprobaciones y rechazos

### 📊 Análisis de Resultados
- **Gráficos Interactivos**:
  - Gráfico de barras comparativo entre candidatos
  - Gráfico circular con totales
  - Estadísticas por candidato
- **Top Postulaciones**: Clasificación de más votadas a favor y en contra
- **Datos en Tiempo Real**: Actualizaciones instantáneas

### 🔐 Sistema de Permisos
Control granular de acceso mediante permisos:
- `applications.view` - Ver postulaciones
- `applications.vote.create` - Emitir votos
- `applications.vote.view` - Ver resultados de votación
- `applications.sync` - Sincronizar datos

### 🔄 Sincronización de Datos
- **Sincronización Automática**: Sincroniza datos al cargar
- **Sincronización Manual**: Botón para sincronizar bajo demanda
- **Compatibilidad Multi-fuente**: API externa + Firestore

### 👤 Autenticación
- **Google Sign-In**: Fácil acceso con cuenta Google
- **Perfiles de Usuario**: Almacenamiento de datos en Firestore
- **Sesión Persistente**: Mantiene la sesión entre recargas

---

## 🏗️ Estructura Técnica

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Autenticación**: Firebase Authentication
- **Base de Datos**: Firestore
- **Gráficos**: Recharts
- **Enrutamiento**: Wouter

### Arquitectura
```
src/
├── components/        # Componentes reutilizables
│   ├── ApplicationCard.tsx
│   ├── ApplicationDetailsModal.tsx
│   ├── ApplicationVoteCharts.tsx
│   ├── VotingPanel.tsx
│   └── ui/           # Componentes UI base
├── contexts/         # Context API (Auth)
├── hooks/            # Custom hooks (useAuth, usePermissions)
├── pages/            # Páginas de la aplicación
│   ├── dashboard/
│   ├── home/
│   ├── login/
│   └── voting/
├── services/         # Servicios (APIs, Firestore)
├── types/            # Definiciones de tipos TypeScript
└── lib/              # Configuración (Firebase)
```

---

## 🚀 Primeros Pasos

### Requisitos Previos
- Node.js 18+
- npm o bun
- Cuenta Firebase configurada

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd tomas.exdev.cl
```

2. **Instalar dependencias**
```bash
npm install
# o
bun install
```

3. **Configurar variables de entorno**
Crea un archivo `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
# o
bun run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🔐 Configuración de Seguridad

### Firestore Security Rules
Las reglas de seguridad están configuradas en `firestore.rules`:
- ✅ Validación de permisos a nivel de BD
- ✅ Control de autoría de votos
- ✅ Restricción de datos sensibles

Para implementar:
1. Ve a Firebase Console → Firestore → Rules
2. Reemplaza con el contenido de `firestore.rules`
3. Publica los cambios

Ver: [FIRESTORE_SECURITY_RULES.md](./FIRESTORE_SECURITY_RULES.md)

### Configuración de Permisos
Para asignar permisos a usuarios, edita sus documentos en Firestore:
```json
{
  "email": "usuario@exdev.cl",
  "permissions": [
    "applications.view",
    "applications.vote.create",
    "applications.vote.view"
  ]
}
```

Ver: [SETUP_PERMISOS.md](./SETUP_PERMISOS.md)

---

## 📊 Estructura de Datos

### Colección: `users`
```json
{
  "email": "usuario@exdev.cl",
  "permissions": ["applications.view", "applications.vote.create"]
}
```

### Colección: `applications`
```json
{
  "rut": "12345678-K",
  "nombre_completo": "Juan Pérez García",
  "correo_institucional": "juan@uc.cl",
  "carrera": "Ingeniería Civil",
  "campus": "San Joaquín",
  "edad": 20,
  "anio_ingreso": 2022,
  "anio_actual": 2,
  "ayudantias": "2",
  "area_interes1": "Backend",
  "area_interes2": "Cloud",
  "motivo_postulacion": "Quiero aprender...",
  "proyecto_idea": "API REST",
  "pitch": "Corta descripción",
  "portafolio": "https://...",
  "horas_disponibles_semanales": "10",
  "created_at": "2025-11-10T12:00:00Z"
}
```

### Sub-colección: `applications/{rut}/votes`
```json
{
  "userId": "firebase-uid",
  "userName": "Nombre Usuario",
  "userEmail": "usuario@exdev.cl",
  "applicationRut": "12345678-K",
  "vote": "aprobar",
  "justification": "Excelentes habilidades...",
  "timestamp": "2025-11-10T14:30:00Z"
}
```

---

## 📚 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

### Firebase
```bash
firebase emulators:start  # Iniciar emuladores locales
firebase deploy           # Desplegar a Firebase
```

---

## 🔄 Flujo de Uso

### Para Votantes
1. Inicia sesión con Google
2. Ve la lista de postulaciones
3. Haz clic en un candidato para ver detalles
4. Emite tu voto (Aprobar/Rechazar) con justificación
5. Visualiza los resultados en tiempo real

### Para Observadores
1. Inicia sesión con Google
2. Ve la lista de postulaciones
3. Accede a la pestaña "Votación" para ver gráficos
4. Analiza resultados e estadísticas

### Para Administradores
1. Todas las funciones anteriores +
2. Botón de sincronización para actualizar datos
3. Gestión de permisos de usuarios (en Firestore)

---

## 🛡️ Consideraciones de Seguridad

### ✅ Implementado
- Autenticación Firebase (Google OAuth)
- Security Rules en Firestore
- Validación de permisos en cliente
- Votos asociados a usuario autenticado
- Datos de usuario protegidos

### ⚠️ Recomendaciones
- Implementar Cloud Functions para operaciones administrativas
- Configurar backups automáticos en Firestore
- Implementar auditoría de votos
- Rate limiting en sincronización
- Monitoreo de accesos no autorizados

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama (`git checkout -b feature/mi-feature`)
2. Commit tus cambios (`git commit -m 'Add mi-feature'`)
3. Push a la rama (`git push origin feature/mi-feature`)
4. Abre un Pull Request

---

## 📝 Licencia

Este proyecto se rige por la licencia GNU GPL v3. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

## 💬 Soporte

Para reportar bugs o solicitar features, contacta con el equipo de desarrollo del Club ExDev.

---

## 🔗 Enlaces Útiles

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## Créditos
Este proyecto fue creado por el Club de Desarrollo Experimental (ExDev) de la Universidad Tecnológica Metropolitana y es mantenido por los propios estudiantes. Mira los perfiles que han contribuido a este proyecto:

<a href="https://github.com/exdevutem/tomas.exdev.cl/graphs/contributors">
  <img alt="Contribuidores" src="https://contrib.rocks/image?repo=exdevutem/tomas.exdev.cl" />
</a>