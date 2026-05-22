<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Summary

- **Bugfix — Metraje etiquetas not saving** (`app/api/pedidos/[id]/route.ts:468`): Metraje creation code was inside `if (!esPedidoDeStaff)` block. Staff-created orders skipped etiqueta creation. Moved it outside the guard.

- **Bugfix — PUT handler deleting MetrajeEtiqueta on pedido modify** (`app/api/pedidos/[id]/route.ts:110`): Replaced `deleteMany` + recreate with diff-based logic. Now UP/DELETE items by detalleId: items with metraje etiquetas are **preserved**, items without etiquetas not in the incoming list are deleted. Frontend now sends `detalleId` in PUT request.

- **Bugfix — PUT retrocede estado si agrega piezas** (`app/api/pedidos/[id]/route.ts`): Si se crean nuevos artículos tipo pieza y el pedido estaba en `metraje_confirmado`, retrocede a `metraje_en_proceso` para que el empleado pueda registrar el metraje del nuevo ítem.

- **Feature — Categoria badge in metraje UI** (`app/dashboard/pedidos-admin/actions.tsx:532`): Added `categoria` badge next to product name so employees can differentiate products with identical names from different categories.

