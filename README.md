# Calculadora de Quincenas 💰

App para llevar tus finanzas personales por quincenas, en pesos colombianos (COP) y con la hora de Bogotá.
Funciona en el celular, se puede instalar como app (PWA) y guarda todo **solo en tu dispositivo**.

- **Ingresos** = Sueldo quincenal (SQ) + Trabajos adicionales (TA)
- **Gastos (GQ)** = Pagos propios (PP)
- **Pagos compartidos (PC)**: solo muestra su propio total, no se resta
- **Total restante** = Ingresos − GQ (verde si es positivo, rojo si es negativo)

Quincena 1 = días 1 al 15. Quincena 2 = día 16 al último día del mes.

---

## 1. Correrla en tu computador

Necesitas **Node.js 20 o más nuevo** (descárgalo en https://nodejs.org, versión "LTS").

Abre una terminal dentro de la carpeta del proyecto y escribe:

```bash
npm install      # descarga las librerías (solo la primera vez)
npm run dev      # enciende la app
```

Abre en el navegador la dirección que aparece (normalmente http://localhost:5173).

**Para verla en tu celular mientras programas:** conecta el celular al mismo WiFi y abre la dirección
"Network" que muestra la terminal (por ejemplo http://192.168.1.20:5173).
Ojo: Google Calendar no funciona por esa dirección (Google exige `https` o `localhost`); el resto sí.

Otros comandos útiles:

```bash
npm test         # corre las pruebas automáticas
npm run build    # crea la versión final en la carpeta dist/
```

---

## 2. Conectar Google Calendar (opcional)

La app funciona perfecto sin esto. Si lo activas, puedes ver tus eventos de la quincena,
crear recordatorios de cada pago con fecha y crear los días de pago del sueldo (15 y último día del mes).

### Paso a paso en Google Cloud Console

1. Entra a https://console.cloud.google.com con tu cuenta de Google.
2. **Crear proyecto:** arriba a la izquierda, haz clic en el selector de proyectos → **Proyecto nuevo**.
   Ponle un nombre, por ejemplo `calculadora-quincenas`, y dale **Crear**. Asegúrate de que quede seleccionado.
3. **Activar la API:** menú ☰ → **APIs y servicios** → **Biblioteca**. Busca **Google Calendar API**,
   ábrela y presiona **Habilitar**.
4. **Pantalla de consentimiento:** menú ☰ → **APIs y servicios** → **Pantalla de consentimiento de OAuth**
   (en algunas cuentas aparece como **Google Auth Platform → Branding**).
   - Tipo de usuario: **Externo**.
   - Nombre de la app: `Quincenas`. Correo de asistencia y de contacto: tu correo.
   - Guarda. En la sección **Público / Audience**, en **Usuarios de prueba**, agrega **tu propio correo de Gmail**.
     (Mientras la app esté "en prueba", solo los correos de esa lista pueden conectarse. Para uso personal es suficiente.)
   - En **Acceso a datos / Scopes** puedes agregar `.../auth/calendar.events` (si no lo agregas, Google lo pedirá igual al conectar).
5. **Crear el Client ID:** menú ☰ → **APIs y servicios** → **Credenciales** → **+ Crear credenciales** →
   **ID de cliente de OAuth**.
   - Tipo de aplicación: **Aplicación web**.
   - En **Orígenes autorizados de JavaScript** agrega:
     - `http://localhost:5173` (para probar en tu computador)
     - `https://TU-APP.vercel.app` (la dirección que te dé Vercel; puedes agregarla después)
   - No hace falta llenar "URI de redireccionamiento".
   - Presiona **Crear** y copia el **ID de cliente** (se ve como `123456-abc.apps.googleusercontent.com`).
     No necesitas el "secreto del cliente".

### Dónde poner el Client ID

En la carpeta del proyecto, copia el archivo `.env.example` con el nombre **`.env.local`** y pega tu ID:

```
VITE_GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
```

Apaga y vuelve a encender `npm run dev`. Ya verás el botón **Conectar Google Calendar**.

> `.env.local` no se sube a GitHub (está en `.gitignore`). Por eso en Vercel lo pones aparte (ver abajo).
> El Client ID no es secreto, pero así lo mantienes ordenado.

Cuando conectes por primera vez, Google te mostrará "Google no ha verificado esta app":
es normal porque la app es tuya. Toca **Continuar**.
La conexión dura aproximadamente una hora; después la app te pedirá conectar otra vez con un toque.

---

## 3. Publicarla gratis en Vercel

1. **Sube el código a GitHub:** crea un repositorio nuevo en https://github.com/new (por ejemplo `calculadora-quincenas`)
   y sube esta carpeta. Desde la terminal, dentro de la carpeta:
   ```bash
   git init
   git add .
   git commit -m "Calculadora de quincenas"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/calculadora-quincenas.git
   git push -u origin main
   ```
2. Entra a https://vercel.com y regístrate con tu cuenta de GitHub (plan **Hobby**, gratis).
3. **Add New… → Project** → elige tu repositorio → **Import**.
   Vercel detecta solo que es **Vite**; no cambies nada.
4. Antes de darle Deploy, abre **Environment Variables** y agrega:
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: tu Client ID
5. Presiona **Deploy**. En un minuto tendrás una dirección como `https://calculadora-quincenas.vercel.app`.
6. Vuelve a Google Cloud → Credenciales → tu ID de cliente, y agrega esa dirección en
   **Orígenes autorizados de JavaScript**. Guarda (puede tardar unos minutos en aplicar).

Cada vez que hagas `git push`, Vercel publica la nueva versión solo.

---

## 4. Instalarla en el celular

Abre tu dirección de Vercel en el celular:

- **Android (Chrome):** menú ⋮ → **Instalar app** (o "Agregar a pantalla principal").
- **iPhone (Safari):** botón Compartir → **Agregar a inicio**.

Queda como una app con su ícono y funciona aun sin internet (excepto el calendario).

---

## 5. Tus datos

- Se guardan en el navegador del dispositivo (localStorage). No hay servidor ni base de datos.
- Cada dispositivo tiene sus propios datos. Para pasarlos de uno a otro usa **Exportar JSON** y luego **Importar JSON**.
- Si borras los datos del navegador o desinstalas la app, se pierden: exporta un respaldo de vez en cuando.

## Cómo está organizado el código

```
src/
  App.tsx              pantalla principal (une todo)
  types.ts             forma de los datos
  lib/quincena.ts      fechas y quincenas (hora de Bogotá)
  lib/calc.ts          sumas y "copiar gastos fijos"
  lib/format.ts        formato de pesos: $ 1.250.000
  lib/storage.ts       guardar, exportar e importar
  lib/gcal.ts          Google Calendar
  components/          cada sección de la pantalla
```
