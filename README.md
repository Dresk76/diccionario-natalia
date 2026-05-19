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
- Android: menú → **"Agregar a pantalla de inicio"**
- iPhone: botón compartir → **"Añadir a pantalla de inicio"**

---

## ✏️ Cómo agregar una nueva palabra

Abrí el archivo `src/entries.js` y agregá un bloque nuevo:

```js
{
  id: "nombre-unico-sin-espacios",
  palabra: "La palabra o frase",
  definicion: "Qué significa y en qué contexto la usa.",
  ejemplo: "Frase de ejemplo de cómo la usa.",
  fecha: "2026-05-17",
},
```

Después hacé commit y push — GitHub Actions reconstruye y despliega solo.

---

## 🎨 Cómo cambiar los colores

Abrí `src/styles.css` y modificá las variables al principio del archivo:

```css
:root {
  --color-fondo:        #fdf6ee;   /* Fondo general */
  --color-header-bg:    #2d1a0e;   /* Color del header */
  --color-acento:       #c8963e;   /* Dorado (bordes, números) */
  /* ... etc */
}
```

---

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/diccionario-natalia/`
