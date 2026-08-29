# Prompt para Rediseño de AuditorIA — Stitch

## Contexto General

AuditorIA es una plataforma SaaS de auditoría y auto-sanación de infraestructura con IA para flotas de equipos Windows. Usa FleetDM + Osquery para gestión de endpoints, Flowise para el agente AI, y n8n para automatización. Stack técnico: Angular 21 + NestJS + PostgreSQL + Docker.

---

## Estructura de Navegación

### Top Header Bar (72px alto)
- **Izquierda**: Logo "AuditorIA" con badge "Executive Studio" debajo
- **Centro**: Barra de búsqueda global con atajo `⌘K` — placeholder: "Buscar dispositivos, reportes o alertas..."
- **Derecha**: 
  - Botón configuración (ícono de engranaje)
  - Botón notificaciones (campana) con badge de contador de no leídas (rojo)
  - Avatar del usuario con nombre
  - Botón logout

### Sub-Header Navigation (barra horizontal debajo del header)
- Navegación por secciones con íconos + texto
- Secciones: **Principal** (Dashboard, Inventario, Asistente Virtual), **Seguridad** (Auditoría, Alertas, Reportes, Políticas), **Sistema** (Usuarios, Configuración)
- Item activo con fondo de color y texto en negrita
- Scroll horizontal en mobile

### Floating Chat Button
- Botón flotante circular (verde) en la esquina inferior derecha
- Abre un drawer lateral derecho con el chat del asistente AI

---

## Secciones / Páginas

### 1. Login
- Fondo claro
- Card centralizada con:
  - Logo AuditorIA
  - Campo email
  - Campo contraseña
  - Botón "Iniciar sesión"
  - Link "¿Olvidaste tu contraseña?"
- Diseño limpio, minimalista, corporativo

### 2. Forgot Password / Reset Password
- Similar al login
- Campo email para enviar link de recuperación
- Reset: campos nueva contraseña + confirmación

### 3. Dashboard
**Stats Cards (fila de 4 cards):**
- **Hosts Totales**: número grande + tendencia (ej: "+2 esta semana") en verde
- **Hosts En Línea**: número + porcentaje de disponibilidad
- **Políticas Activas**: número + estado (ej: "Todas cumple")
- **Alertas Críticas**: número + label "Requiere atención" en rojo

**Tabla de Hosts Conectados:**
- Columnas: Dispositivo (hostname + OS), Estado (badge online/offline), Última Conexión, Políticas (cumplidas/total)
- Filas con hover sutil

**Activity Feed (panel lateral derecho):**
- Timeline vertical con dots de color por tipo de evento
- Tipos: verde (éxito), amarillo (advertencia), azul (info), rojo (error)
- Cada item: ícono + texto descriptivo + timestamp relativo

**Políticas de Cumplimiento (grid 2x2):**
- Cards con: badge de estado (verde=Cumple, rojo=Incumple), nombre, descripción, meta (hosts cumplidos, último check)

### 4. Inventario de Dispositivos
- Tabla completa de hosts
- Columnas: Hostname, Modelo, OS, CPU, RAM, Estado, Última conexión, Políticas
- Filtros por estado, OS
- Búsqueda en tiempo real
- Click en host abre detalle

### 5. Asistente Virtual (Chat)
**Diseño del chat (drawer lateral o página completa):**
- Header: avatar del bot "AuditorIA", nombre, badge "En línea" verde
- Messages area con scroll
- Mensajes del usuario: alineados a la derecha, fondo azul
- Mensajes del asistente: alineados a la izquierda, fondo gris claro
- Markdown rendering en respuestas (tablas, negritas, listas)
- Input area: campo de texto + botón micrófono + botón enviar
- Sugerencias rápidas: chips clickeables ("Resumen de seguridad", "Mostrar equipos en riesgo", etc.)

### 6. Historial
- Lista de sesiones de chat anteriores
- Cada item: timestamp, preview del mensaje, estado
- Click para reanudar sesión

### 7. Administración de Usuarios (solo super_admin)
- Tabla de usuarios registrados
- Columnas: Nombre, Email, Rol, Estado, Última conexión
- Acciones: Editar rol, Desactivar
- Botón "Crear usuario"

### 8. Centro de Ayuda / Documentación
- Sidebar con categorías de ayuda
- Contenido principal con artículos
- Búsqueda de artículos

### 9. Configuración (drawer lateral)
- Seguridad de la cuenta
- Cambio de contraseña
- Configuración MFA (si aplica)

---

## Notificaciones (Dropdown desde header)
- Lista de alertas de auditoría
- Cada item: dot de severidad (rojo=critical, amarillo=warning), título, mensaje
- Botón "Activar sistema" (notificaciones del navegador)
- Botón "Marcar leídas"
- Empty state: "Sin problemas detectados en auditorías"

---

## Estilo Visual

- **Tema**: Corporativo premium, limpio, profesional
- **Paleta**: Fondo claro (#F4F6F9), blanco para cards, texto oscuro (#0F172A), acentos verdes (#059669)
- **Tipografía**: Inter, pesos 400-800
- **Bordes**: Redondeados suaves (12px cards, 8px inputs, 20px chat bubbles)
- **Sombras**: Sutiles (shadow-xs, shadow-md)
- **Responsive**: Mobile-first, sidebar colapsa en mobile
- **Sin emojis**: Solo íconos SVG inline
- **Dark mode**: Toggle disponible

---

## Datos que aparecen en cada sección

### Dashboard
- Número total de hosts registrados
- Número de hosts online/offline
- Porcentaje de disponibilidad
- Número de políticas activas
- Número de alertas críticas
- Hostname, modelo, OS de cada equipo
- Estado online/offline de cada equipo
- Última conexión (timestamp relativo)
- Políticas cumplidas/total por host
- Descripción de cada evento reciente
- Estado de cada política (cumple/incumple)
- Hosts afectados por cada política
- Último check de cada política

### Asistente Virtual
- Mensajes del usuario (texto libre)
- Respuestas del agente (markdown: tablas, listas, negritas, código)
- Timestamp de cada mensaje
- Sugerencias predefinidas
- Estado del agente (en línea/procesando)

### Inventario
- Hostname completo
- Modelo de hardware
- Sistema operativo y versión
- CPU y RAM
- Estado de conexión
- Última vez que reportó
- Número de políticas cumplidas

### Notificaciones
- Título de la alerta
- Mensaje descriptivo
- Severidad (critical/warning)
- Timestamp
- Estado de lectura (leída/no leída)
