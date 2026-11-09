# Guía de inicio — Cielo Claro (para Aerotécnicos ETFA)

Esta guía explica, paso a paso y sin asumir experiencia previa, cómo descargar
este proyecto a tu computadora, instalarlo y correrlo en local. No necesitas
crear ninguna cuenta de pago ni configurar nada "secreto": el proyecto trae
una clave de ejemplo (inventada) para que funcione en **modo demo** apenas lo
descargues.

## 0. ¿Qué vas a tener al final?

El mismo panel que ves en [cielo-claro.vercel.app](https://cielo-claro.vercel.app/),
corriendo en tu propia computadora en `http://localhost:3000`, con el código
fuente completo para leer, modificar y aprender de él.

## 1. Instalar los programas necesarios

Solo necesitas dos programas, ambos gratuitos:

1. **Node.js** (versión 20 o más reciente) — [nodejs.org](https://nodejs.org/es)
   Descarga la versión "LTS" y sigue el instalador con las opciones por defecto.
   Para confirmar que quedó instalado, abre una terminal (CMD, PowerShell o
   Git Bash) y escribe:
   ```
   node -v
   npm -v
   ```
   Deberías ver dos números de versión, no un error.

2. **Git** — [git-scm.com](https://git-scm.com/downloads)
   Instalador con opciones por defecto. Para confirmar:
   ```
   git --version
   ```

(Opcional pero recomendado) **Visual Studio Code** — [code.visualstudio.com](https://code.visualstudio.com/)
para leer y editar el código cómodamente.

## 2. Descargar el proyecto (clonar el repositorio)

Abre una terminal en la carpeta donde quieras guardar el proyecto y ejecuta:

```
git clone https://github.com/JuanSQuezada/Cielo_Claro.git
cd Cielo_Claro
```

Esto descarga una copia completa del código y de todo el historial de
cambios (la "bitácora" de commits).

## 3. Instalar las dependencias

Dentro de la carpeta del proyecto:

```
npm install
```

Esto descarga las librerías que el proyecto usa (Next.js, React, Recharts,
react-leaflet, etc.) a una carpeta `node_modules/` local. Puede tardar uno o
dos minutos la primera vez.

## 4. Correr el proyecto en local

```
npm run dev
```

Abre el navegador en [http://localhost:3000](http://localhost:3000). Deberías
ver el panel completo: METAR, semáforo de categoría de vuelo, mapa de eventos
naturales, gráfico de clima y el clasificador de fotos del cielo.

## 5. Sobre la clasificación de fotos (clave de Azure)

El archivo `lib/config.ts` trae una **clave de ejemplo inventada** para el
servicio de IA (Azure Custom Vision) que clasifica las fotos del cielo. Con
esa clave de ejemplo, la clasificación de fotos entra automáticamente en
**"modo demo"**: en vez de llamar a un modelo real, el servidor responde con
predicciones de ejemplo y te avisa claramente en pantalla que es una
simulación. El resto del panel (METAR, mapa, clima) sí usa datos 100% reales
de NOAA y NASA, sin ningún "modo demo".

Si quieres conectar tu **propio** modelo de IA y ver predicciones reales:

1. Entrena tu propio modelo en Azure Custom Vision (ver el video
   "Cómo obtener una clave de Azure Custom Vision" en la carpeta de recursos).
2. Reemplaza los valores de `AZURE_PREDICTION_URL` y `AZURE_PREDICTION_KEY`
   en `lib/config.ts` por los tuyos.
3. Vuelve a correr `npm run dev`.

`lib/config.ts` tiene un comentario explicando por qué esa clave está
"hardcodeada" (escrita directo en el código) en vez de en variables de
entorno, y cómo se haría correctamente en un proyecto real. Vale la pena
leerlo — es una de las lecciones más importantes de seguridad al programar.

## 6. Estructura del proyecto (mapa rápido)

```
app/page.tsx            — arma la página uniendo los componentes
app/api/*/route.ts       — las únicas partes que hablan con APIs externas
components/              — un archivo por cada pieza visual del panel
lib/                     — toda la lógica (cálculos, tipos, configuración)
datos/                   — ejemplos reales de cada API, para estudiarlos
BITACORA.md              — el registro completo de cómo se construyó, prompt
                           por prompt, con Claude Code
```

## 7. ¿Y si algo no funciona?

- `npm install` falla → revisa que `node -v` funcione; si no, reinstala Node.js.
- El puerto 3000 está ocupado → cierra otros procesos de `npm run dev` o usa
  `npm run dev -- -p 3001`.
- Alguna sección del panel muestra un error → es normal si NOAA o NASA están
  momentáneamente caídos; el resto del panel sigue funcionando (así se diseñó
  a propósito).

## 8. Para ir más allá

- Lee `BITACORA.md`: ahí está, en orden, cada instrucción que se le dio a la
  IA (Claude Code) y qué hizo con ella — es el "detrás de cámaras" completo.
- Lee `RETO.md` para ver el problema original que se resolvió.
- Lee `CLAUDE.md` para ver las reglas de arquitectura que se le pidieron a
  la IA que respetara durante todo el proyecto.
