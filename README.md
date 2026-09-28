# Los Andes · portal de reclutamiento

Aplicación Next.js para convocatoria, registro de postulaciones y análisis de RR. HH.

## Rutas

- `/home`: portada y navegación principal.
- `/postulate`: cargos abiertos y formulario de postulación.
- `/admin`: acceso restringido, dashboard analítico, cargos y seguimiento de postulaciones.
- `/`: redirige a `/home`.

## Fuente de datos

La hoja [bdd_los_andes](https://docs.google.com/spreadsheets/d/1QrrRaTMapWgsK_0LbaSdAr79BfhN9DD7ot5mi7gHhJ4/edit) contiene `oportunidades`, `postulantes`, `postulaciones`, `experiencias`, `educaciones`, `auditoria` y `usuarios`. Se trasladaron los registros históricos de la hoja anterior; las cuatro oportunidades anteriores quedaron cerradas y se añadieron C1, C2, C3, C4, C6, C7, C8 y C9 como abiertas. La pestaña `usuarios` contiene la cuenta de demostración `admin/admin` solicitada para el proyecto académico. Sustitúyela antes de usar datos reales.

Los datos históricos no contienen género, fecha de nacimiento ni evaluaciones. El dashboard muestra explícitamente la falta de esos campos, sin fabricar estadísticas. El mapa es esquemático y solo ubica ciudades bolivianas reconocidas por nombre; también enumera otras residencias.

## Configurar Apps Script

1. Abre la hoja nueva y usa **Extensiones → Apps Script**. Copia el contenido completo de `google-apps-script/Code.gs` en `Code.gs` y guarda. El ID de la hoja nueva ya está configurado en el archivo.
2. En **Configuración del proyecto**, fija la zona horaria en `America/La_Paz`. El usuario y la contraseña de administración se leen de la pestaña `usuarios`. `API_KEY` y `ADMIN_SESSION_SECRET` ya no se usan en las propiedades de Apps Script y puedes eliminarlas. Restringe el acceso de edición al proyecto Apps Script y a la hoja.
3. En **Implementar → Nueva implementación → Aplicación web**, ejecuta como **tu cuenta** y elige el acceso que permita llamar **sin iniciar sesión de Google** (`ANYONE_ANONYMOUS`, habitualmente «Cualquier persona» o «Cualquiera, incluso anónimo»). La opción «Cualquier usuario» puede exigir una cuenta de Google y bloquear a Vercel. La consulta de cargos y el envío de postulaciones son públicos; Apps Script comprueba `usuarios` al iniciar sesión y entrega un token temporal para las acciones administrativas. Autoriza acceso a Sheets. Copia la URL `/exec`.
4. Cuando cambies el código, usa **Implementar → Gestionar implementaciones → Editar → Nueva versión**. Prueba una postulación y una sesión administrativa.

## Vercel

En **Project Settings → Environment Variables**, configura (Production y Preview):

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT/exec
```

No uses el prefijo `NEXT_PUBLIC_` para estos valores. `APPS_SCRIPT_API_KEY` y `ADMIN_SESSION_SECRET` ya no se leen en Vercel. Despliega `main` y prueba `/home`, `/postulate`, el envío de una postulación y `/admin`. Las vacantes públicas usan **Vercel Data Cache**, compartida entre instancias, con revalidación a los 120 segundos. Las lecturas administrativas consultan Apps Script en cada solicitud para validar el token de sesión; Apps Script mantiene su propia caché de datos. La primera lectura pública en una caché vacía sí espera a Apps Script. Las mutaciones invalidan la caché pública. El servidor responde a clientes administrativos con `Cache-Control: no-store`; sus datos no deben almacenarse en cachés públicas del navegador/CDN.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
```

En local la caché de desarrollo de Next puede diferir de la caché persistente de Vercel. La verificación de rendimiento compartido debe realizarse tras desplegar en Vercel.
