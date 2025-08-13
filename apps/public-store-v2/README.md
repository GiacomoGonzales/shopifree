# Public Store v2

App Next.js (App Router + TypeScript) para la tienda pública con SSR mínimo.

Comandos:

- dev: `pnpm run dev --filter @shopifree/public-store-v2` o desde raíz `npm run dev:public-store-v2`
- build: `pnpm run build --filter @shopifree/public-store-v2`
- start: `pnpm run start --filter @shopifree/public-store-v2`

Desarrollo local:

- Puerto: 3004
- Probar: `http://localhost:3004/lunara`
- Healthcheck: `http://localhost:3004/healthz` -> "ok"

Arquitectura:

- SSR mínimo: solo HTML base + metadata segura
- UI y datos 100% en CSR con `dynamic(..., { ssr: false })`
- Middleware reescribe subdominio a ruta `/[storeSubdomain]`


