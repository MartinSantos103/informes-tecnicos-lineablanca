# Sistema de Informes Técnicos

Aplicación web diseñada para técnicos de servicio en campo (línea blanca, refrigeración y mantenimiento). Permite registrar intervenciones técnicas, calcular presupuestos y generar informes en PDF con formato profesional listos para compartir por WhatsApp o correo electrónico desde el teléfono o la computadora.

---

## 🎯 Problema que resuelve y capacidades

En el trabajo técnico a domicilio, emitir diagnósticos y presupuestos en papel o mediante mensajes informales suele generar pérdida de información, falta de respaldo para el cliente y demoras en el cobro. 

Esta herramienta centraliza el flujo de trabajo:
- **Carga rápida en campo**: Formulario optimizado para móviles con validación estricta de datos (React Hook Form + Zod).
- **Generación de PDF en el dispositivo**: Los informes se renderizan de forma vectorial del lado del cliente usando `@react-pdf/renderer`, sin sobrecargar el servidor con navegadores headless pesados.
- **Distribución inmediata**: Integración con Web Share API y enlaces directos a WhatsApp para enviar el PDF o el resumen del servicio con un toque.
- **Historial y búsqueda**: Consulta de intervenciones pasadas con filtros por tipo de equipo, cliente o número de informe.
- **Persistencia en la nube**: Almacenamiento centralizado en PostgreSQL sobre Neon, administrado a través de Serverless Functions en Vercel.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite.
- **Estilos**: Tailwind CSS.
- **Validación de Formularios**: Zod + React Hook Form.
- **Generación de Documentos**: `@react-pdf/renderer`.
- **Backend / API**: Vercel Serverless Functions (`/api/*` en TypeScript con `@vercel/node`).
- **Base de Datos**: PostgreSQL serverless en **Neon** (utilizando `@neondatabase/serverless` para conexiones optimizadas con connection pooling).
- **Hosting & CI/CD**: Vercel con automatizaciones de cron jobs (`/api/keep-alive`).

---

## 📋 Estructura Actual del Informe (Limitación técnica)

Actualmente, el generador de PDF opera con una **estructura de documento estática**. El diseño y los campos están predefinidos y no admiten reordenamiento ni adición de secciones arbitrarias en tiempo de ejecución.

El documento PDF (formato A4) está compuesto por las siguientes secciones fijas:

1. **Encabezado y Membrete**: Logo de la empresa, datos de contacto (dirección, teléfono, email, web), número correlativo de estimación (`#000001`) y fecha de emisión.
2. **Datos del Cliente**: Nombre o razón social, dirección física, teléfono y correo electrónico.
3. **Datos del Equipo**: Tipo de electrodoméstico (lavarropas, heladera, etc.), marca, modelo y número de serie.
4. **Cuerpo Técnico (Campos obligatorios de texto libre)**:
   - **Diagnóstico Técnico**: Descripción del estado general y anomalías detectadas.
   - **Causa**: Origen de la avería (desgaste mecánico, fatiga de componentes, sobretensión, etc.).
   - **Trabajo Recomendado / Repuestos**: Tareas necesarias para la solución y piezas requeridas.
5. **Presupuesto y Cierre**:
   - Monto total estimado.
   - Cláusula o nota legal configurable por empresa (validez del presupuesto, condiciones de garantía).
   - Pie de página con numeración dinámica de páginas.

---

## 🔮 Roadmap / Mejoras a Futuro

- [ ] **Plantillas de informe configurables y dinámicas**: Permitir al usuario definir qué bloques mostrar u ocultar según el rubro o tipo de trabajo (por ejemplo: presupuestos rápidos sin diagnóstico extenso, informes preventivos con checklist de puntos de control, o desglose detallado de mano de obra y repuestos).
- [ ] **Adjunto de fotografías**: Captura de fotos del equipo averiado y piezas reemplazadas para incrustarlas directamente en el PDF.
- [ ] **Firma digital en pantalla**: Reincorporación del canvas de firma digital del cliente para aceptación in situ de presupuestos.
- [ ] **Gestión multi-empresa y roles de técnicos**: Control de acceso granular para talleres con múltiples empleados.

---

## 🚀 Instalación y Desarrollo Local

### 1. Requisitos previos
- Node.js (versión 18 o superior).
- Cuenta en Neon (o cualquier instancia de PostgreSQL).

### 2. Clonar e instalar dependencias
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd Tech_Report
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo y completa tus credenciales de base de datos:
```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
DATABASE_URL="postgresql://usuario:password@ep-ejemplo-pooler...neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://usuario:password@ep-ejemplo...neon.tech/neondb?sslmode=require"
```

### 4. Iniciar el entorno de desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en `http://localhost:5173`.

---

## ☁️ Despliegue en Producción (Vercel)

1. Sube tu código a un repositorio en GitHub.
2. Conecta el repositorio en [Vercel](https://vercel.com).
3. En la sección **Environment Variables** del proyecto en Vercel, agrega:
   - `DATABASE_URL`: La URL de conexión pooled de Neon.
   - `DATABASE_URL_UNPOOLED`: La URL directa de Neon (opcional para operaciones de esquema).
4. El archivo `vercel.json` ya gestiona el enrutamiento para la Single Page Application (SPA), el mapeo de `/api/*` y la tarea programada (`/api/keep-alive`).
5. Presiona **Deploy**.

---

## 📂 Organización del Proyecto

```
Tech_Report/
├── api/                # Serverless Functions desplegadas en Vercel (Auth, Reports, DB client)
├── neon/               # Esquemas SQL y migraciones para Neon PostgreSQL
├── public/             # Recursos estáticos
├── src/
│   ├── components/     # Componentes de UI reutilizables y formularios
│   ├── contexts/       # Contextos globales (Empresa, Auth)
│   ├── hooks/          # Custom hooks (Reportes, Compartir por WhatsApp/Web Share)
│   ├── layouts/        # Layout principal responsive
│   ├── pages/          # Páginas de la aplicación (Nuevo informe, Historial, Detalle, etc.)
│   ├── pdf/            # Plantilla y estilos vectoriales para @react-pdf/renderer
│   ├── services/       # Clientes HTTP y llamadas a la API
│   ├── types/          # Interfaces TypeScript compartidas
│   └── utils/          # Formateadores de moneda, fechas y validaciones Zod
├── vercel.json         # Configuración de rutas, crons y serverless en Vercel
├── vite.config.ts      # Configuración del bundler Vite
└── package.json
```
