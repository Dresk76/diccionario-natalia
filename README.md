# 📖 Diccionario de Natalia

App web progresiva (PWA) con el vocabulario personal de Natalia.
Se puede instalar en el celular como si fuera una app nativa.

---

## 🚀 Cómo subir a GitHub Pages (primera vez)

### 1. Crear el repositorio

- Entrá a [github.com](https://github.com) → **New repository**
- Nombre: `diccionario-natalia` (debe coincidir con el `base` en `vite.config.js`)
- Dejalo en **Public**
- **No** inicialices con README

### 2. Subir el proyecto

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/diccionario-natalia.git
git push -u origin main
```

### 3. Activar GitHub Pages

- En el repo: **Settings → Pages**
- Source: **GitHub Actions**
- Listo. En unos minutos la app estará en:
  `https://TU_USUARIO.github.io/diccionario-natalia/`

### 4. Instalar en el celular

- Abrí esa URL en Chrome (Android) o Safari (iPhone)
- **Android:** menú → *Agregar a pantalla de inicio*
- **iPhone:** botón compartir → *Añadir a pantalla de inicio*

---

## ✏️ Cómo agregar una nueva palabra

Abrí el archivo `src/entries.js` y agregá un bloque nuevo al final de la lista:

```js
{
  id: "nombre-unico-sin-espacios",
  word: "La palabra o frase",
  definition: "Qué significa y en qué contexto la usa.",
  example: "Frase de ejemplo de cómo la usa.",
  date: "2026-05-17",
},
```

Después hacé commit y push — GitHub Actions reconstruye y despliega automáticamente.

---

## 🎨 Cómo cambiar los colores

Abrí `src/styles.css` y modificá las variables al principio del archivo:

```css
:root {
  --color-bg:        #fdf6ee;   /* Fondo general */
  --color-header-bg: #2d1a0e;   /* Color del header */
  --color-accent:    #c8963e;   /* Dorado (bordes, números) */
  /* ... ver el archivo para todas las opciones */
}
```

---

## 💻 Desarrollo local

### 1. Requisitos — Node y NPM

Este proyecto requiere tener instalado **Node.js** y **npm**.
A la fecha de este documento se está trabajando con las siguientes versiones:

```bash
node: v22.16.0
npm:  10.9.2
```

Para verificar qué versión tenés instalada en tu sistema, ejecutá:

```bash
node -v
npm -v
```

Si no tenés Node instalado, o tu versión es anterior a la indicada, descargalo desde:
👉 [https://nodejs.org/es](https://nodejs.org/es)

Asegurate de descargar la misma versión o una posterior a la que figura en este documento.

---

### 2. Instalar dependencias

Una vez tengas Node instalado, abrí una terminal en la raíz del proyecto y ejecutá:

```bash
npm install
```

Este comando lee el archivo `package.json` y descarga todas las librerías necesarias
dentro de la carpeta `node_modules/`. Solo necesitás hacerlo una vez, o cada vez
que se agreguen nuevas dependencias al proyecto.

---

### 3. Correr el proyecto en local

Con las dependencias instaladas, ejecutá:

```bash
npm run dev
```

La terminal te va a indicar que el proyecto está corriendo. Abrí tu navegador en:

```URL
http://localhost:5173/diccionario-natalia/
```

Cualquier cambio que hagas en los archivos se va a reflejar automáticamente
en el navegador sin necesidad de reiniciar.

---

### 4. Preview de producción

**En el flujo normal no necesitás correr este comando** — GitHub Actions lo ejecuta
automáticamente cada vez que hacés push a `main` y despliega el resultado en GitHub Pages.

Sin embargo, podés correrlo manualmente si querés verificar que no hay errores
antes de hacer un push importante, o ver exactamente cómo va a quedar en producción.

Primero generás el build:

```bash
npm run build
```

Genera la carpeta `dist/` con todos los archivos optimizados.
Esta carpeta está en el `.gitignore` — no se sube al repo porque
GitHub Actions la genera sola en cada deploy.

Luego para verlo en el navegador:

```bash
npm run preview
```

---

**Diferencia entre `npm run dev` y `npm run preview`:**

| | `npm run dev` | `npm run preview` |
|---|---|---|bash
| Uso | Desarrollo diario | Verificar antes de publicar |
| Código | Sin optimizar, fácil de debuggear | Optimizado, igual a producción |
| Recarga automática | Sí | No |
| Requiere build previo | No | Sí |

**El flujo típico:**

```bash
Desarrollo diario          →  npm run dev
Antes de un push importante →  npm run build  →  npm run preview  →  git push
Agregar una palabra nueva   →  git push directo, sin build ni preview
```

---

### 4. Generar el build de producción

**En el flujo normal no necesitás correr este comando** — GitHub Actions lo ejecuta
automáticamente cada vez que hacés push a `main` y despliega el resultado en GitHub Pages.

Sin embargo, podés correrlo manualmente si querés:

- Verificar que no hay errores antes de hacer un push importante
- Ver el tamaño final de los archivos generados
- Probar la versión de producción en local con `npm run preview`

```bash
npm run build
```

Genera la carpeta `dist/` con todos los archivos optimizados para producción.
Esta carpeta está en el `.gitignore` — no se sube al repo porque
GitHub Actions la genera sola en cada deploy.

---

### 5. Verificar y gestionar actualizaciones

Para ver si las dependencias tienen versiones más nuevas disponibles, ejecutá:

```bash
npm outdated
```

Vas a ver una tabla como esta:

```bash
Package               Current  Wanted  Latest
@vitejs/plugin-react    4.7.0   4.7.0   6.0.2
react                  18.3.1  18.3.1  19.2.6
react-dom              18.3.1  18.3.1  19.2.6
vite                   5.4.21  5.4.21   8.0.13
```

**Qué significa cada columna:**

- **Current** — versión instalada actualmente en tu máquina
- **Wanted** — versión más alta permitida según el rango definido en `package.json`
- **Latest** — última versión disponible en npm, sin importar rangos

---

**Entendiendo los números de versión — Semantic Versioning**
Toda versión sigue el formato `MAJOR.MINOR.PATCH`, por ejemplo `5.4.21`:

- **PATCH** — `5.4.21 → 5.4.22` — corrección de bug. Actualizá siempre, sin miedo.
- **MINOR** — `5.4.21 → 5.5.0` — feature nueva, compatible con lo anterior. Actualizá con confianza, probá que todo corra.
- **MAJOR** — `5.4.21 → 6.0.0` — cambio grande, puede romper cosas. Leé el *changelog* antes, hacelo con tiempo y probá bien.

---

**Cuándo actualizar según el tipo de cambio:**

| Cambio | Ejemplo | Acción |
|---|---|---|bash
| PATCH | `5.4.21 → 5.4.22` | `npm update` directo |
| MINOR | `5.4.21 → 5.5.0` | `npm update`, verificar que todo funcione |
| MAJOR | `5.4.21 → 6.0.0` | Leer changelog, planificar, probar con calma |

Para actualizar dentro de los rangos seguros del `package.json`:

```bash
npm update
```

**Regla de oro para MAJOR:** nunca actualices varias dependencias MAJOR al mismo tiempo. Hacelo de a una, probás que todo funcione, y recién ahí pasás a la siguiente.

---

**Frecuencia recomendada:**

- Proyecto personal — actualizá solo si algo deja de funcionar o GitHub manda una alerta de seguridad
- Proyecto profesional — revisá con `npm outdated` una vez al mes; PATCH y MINOR en el momento, MAJOR planificado como tarea aparte

GitHub tiene una herramienta llamada **Dependabot** que manda pull requests automáticos cuando hay actualizaciones de seguridad disponibles. Se activa gratis en cualquier repositorio público desde **Settings → Security → Dependabot alerts**.

---

**Estado actual de este proyecto**
Las actualizaciones disponibles son todas MAJOR (React 18→19, Vite 5→8, plugin-react 4→6). No se recomienda actualizar por ahora — el proyecto funciona estable con las versiones instaladas. Cuando se planifique una actualización, hacerlo de a una dependencia a la vez.
