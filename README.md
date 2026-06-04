# Backend - Capital Fest

Este es el proyecto backend para Capital Fest, construido con **Node.js, Express y Prisma**.

## Requisitos previos

- Tener instalado [Node.js](https://nodejs.org/) (se recomienda la versión LTS).
- Servidor de base de datos compatible con la configuración de Prisma.

## Pasos para ejecutar el proyecto localmente

**1. Instalar las dependencias:**

Ubicado en la carpeta principal del proyecto, abre la terminal y ejecuta:

```bash
npm install
```

**2. Configurar las variables de entorno:**

Crea un archivo llamado `.env` en la raíz del proyecto y agrega las siguientes variables (puedes solicitarlas al equipo o usar tu configuración local):

```env
PORT=3000
DATABASE_URL="tu_url_de_conexion_a_la_base_de_datos"
```

**3. Configurar la base de datos (Prisma):**

Para sincronizar la base de datos y generar el cliente de Prisma, ejecuta:

```bash
npx prisma generate
npx prisma db push
```

**4. Levantar el servidor:**

Para iniciar la aplicación, ejecuta el siguiente comando:

```bash
node index.js
```

Si todo está correcto, verás un mensaje en la consola indicando: `Servidor corriendo en http://localhost:3000`.

## Endpoints principales

El backend expone sus rutas principales bajo el prefijo `/api`.
- **Ruta de prueba:** `GET http://localhost:3000/api`
