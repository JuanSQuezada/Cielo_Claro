# Reglas del proyecto — Cielo Claro

- Interfaz y textos en español.
- Un componente por archivo en `components/`.
- Toda la lógica de negocio (cálculo de categoría de vuelo, formateo, llamadas externas) vive en `lib/`, nunca dentro de componentes.
- `app/page.tsx` solo compone componentes, no contiene lógica.
- Código simple, sin abstracciones innecesarias. Sin base de datos, sin login, sin tests.
- Las APIs externas se consumen únicamente desde `app/api/*/route.ts` (nunca desde el cliente), porque `aviationweather.gov` no permite CORS.
- Sin dependencias innecesarias: solo las ya acordadas en el plan (Next.js, TypeScript, Tailwind, react-leaflet, Recharts).
- Si una API externa falla, solo el componente que depende de ella muestra el error; el resto del panel sigue funcionando.
- Debe desplegarse en Vercel sin configuración extra y verse bien en celular.
