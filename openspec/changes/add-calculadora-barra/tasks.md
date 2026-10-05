## 1. Fundamentos de dominio

- [x] 1.1 Extender `src/lib/barbell.ts` con `estimateOneRepMax(peso, reps, formula='epley')` (Epley por defecto `peso*(1+reps/30)`, clamp 1..30, validacion inputs) y verificar con `vitest run src/lib/barbell.test.ts` anadiendo casos 225x1=225, 100x5~116.7, 0/invalido=>null
- [x] 1.2 Extender `calculatePlates(target, unit, barWeight, availablePairs?)` para respetar `paresPorDisco` por denominacion (greedy limitado por disponibilidad) devolviendo `achieved`/`remainder`/`perSide` correctos y verificar con tests de inventario: objetivo 236 lb con 5 pares comunes => achieved 235 lb y remainder 1, y fallback ilimitado sin param
- [x] 1.3 Crear `src/lib/barbell-inventory.ts` con `PLATE_INVENTORY_DEFAULTS_KG/LB`, `DEFAULT_INCREMENT=5`, helpers `loadInventory(guestId)`/`saveInventory` (localStorage `barbell:inventory:v1` + hidratacion opcional desde `Preference`) y verificar con test unitario de round-trip y defaults (55:0,45:5,... en LB)

## 2. Calculadora core UI

- [x] 2.1 Refactorizar `src/components/barbell-calculator.tsx` para inputs superiores `PESO (LB/KG)` y `REPS` + tarjeta central `1RM ESTIMADO` (Barlow Condensed, grande) reactiva a cambios y verificar render en `http://localhost:3000/tools/barbell` muestra 225 lb + 1 rep => 225 1RM
- [x] 2.2 Implementar `PercentageTable` con rango `30%..110%` (o `70%..110%` segun MIN_PCT decidido, default 30) generado via `useMemo` desde 1RM e incremento, con filas `%` Ember + `peso lb/kg` + chevron `>` y hint `-- TOCA UNA FILA PARA VER LOS DISCOS --`, y verificar que 1RM=225, inc=5% muestra `110% 248 lb`, `105% 236 lb`, `100% 225 lb`
- [x] 2.3 Implementar selector de incremento pill `5%` en header de PORCENTAJES que abre modal/bottom-sheet `Incremento de porcentaje` con opciones `1%,2%,5%,10%,15%`, check en actual, botones `Cancelar`/`Listo` y persistencia, y verificar que cambiar a `10%` regenera tabla en saltos de 10% y Cancelar no cambia estado
- [x] 2.4 Implementar modal de visualizacion de discos al tocar fila (componente `PlateVisualization` con barra SVG + rects por disco y colores por peso, header `%` Ember + peso teorico, texto `Peso mas cercano posible: X lb/kg` cuando `achieved != target`, boton `X`/backdrop cierra) y verificar que tocar `105% 236 lb` muestra 2x45+5 por lado y texto `235 lb` y cerrar vuelve a tabla

## 3. Inventario

- [x] 3.1 Crear ruta `src/app/tools/barbell/inventory/page.tsx` (server shell) + `InventoryEditor` cliente con campo `PESO DE LA BARRA` (45 LB default, sufijo LB/KG, descripcion helper) y lista `PARES DE DISCOS DISPONIBLES` con filas `peso | - | N pares | +` (LB: 55,45,35,25,15,10,5,2.5,1.25,1 | KG: 25,20,15,10,5,2.5,1.25,1,0.5) deshabilitando `-` en 0 y `+` en max, navegable desde engranaje top-right y back, y verificar navegacion engranaje->inventario->volver mantiene inputs
- [x] 3.2 Conectar inventario a calculo: pasar `availablePairs` y `barWeight` desde estado/persistencia a `calculatePlates` en tabla y modal, recalcular al editar inventario y verificar que reducir pares de `45 lb` a 0 cambia `100% 225 lb` de `2x45` a combinacion alternativa y actualiza `Peso mas cercano posible`

## 4. Integracion, estilo y calidad

- [x] 4.1 Aplicar estilos Forge Dark fieles al mockup (Forge Black/Surface/Card/Border, Ember `#FF3D23`, Barlow Condensed uppercase para `CALCULADORA DE BARRA` y `PORCENTAJES`, Inter para cuerpo, Cards radius 16px, pill incremento borde Ember, targets min 48px) y verificar visual en viewport 390px sin overflow y contraste AA
- [x] 4.2 Integrar unidad y persistencia: hidratar `defaultUnit` desde `getGuestOrNull().preference.weightUnit`, convertir pesos entre KG/LB al cambiar unidad, y persistir `barWeight`/`platePairs`/`increment` por guest, y verificar que guest LB ve `45 lb` por defecto y guest KG ve `20 kg` y que recargar mantiene valores
- [x] 4.3 Ampliar tests: `barbell.test.ts` (estimateOneRepMax), `barbell-inventory.test.ts` (defaults/persist), y tests de componente para tabla/modal si aplica, y verificar `npm test` pasa
- [x] 4.4 Verificar calidad general: ejecutar `npm run lint`, `npm run build` (prisma generate + next build + tsc) sin errores y smoke `npm run dev` + curl/`chrome-devtools` a `/tools/barbell` y `/tools/barbell/inventory` responden 200 y no hay errores de consola

