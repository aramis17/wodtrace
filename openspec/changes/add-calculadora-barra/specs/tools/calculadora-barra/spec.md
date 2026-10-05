## Purpose

Permite a atletas estimar su 1RM, explorar cargas por porcentaje y visualizar el montaje de discos mas cercano segun su inventario real, llevando la Calculadora de Barra del mockup a producto con experiencia Forge Dark y datos por guest.

## ADDED Requirements

### Requirement: Estimacion de 1RM desde peso y repeticiones
El sistema SHALL calcular el 1RM estimado a partir de los inputs `PESO` y `REPS` usando formula Epley por defecto `1RM = peso * (1 + reps/30)` y mostrarlo en la tarjeta central `1RM ESTIMADO`.

#### Scenario: Peso 225 lb con 1 rep
- **WHEN** el usuario ingresa `PESO=225` en LB y `REPS=1`
- **THEN** el sistema muestra `1RM ESTIMADO = 225` (unidad segun preferencia del guest)

#### Scenario: Peso con multiples reps
- **WHEN** el usuario ingresa `PESO=100` KG y `REPS=5`
- **THEN** el sistema muestra `1RM = 100 * (1 + 5/30) = 116.7` redondeado segun `roundWeight` (0.5 kg / 1 lb) y actualiza todos los derivados (porcentajes y discos)

#### Scenario: Entradas invalidas
- **WHEN** PESO es vacio, 0, negativo, no numerico, o REPS es 0/vacio
- **THEN** el sistema no muestra 1RM valido, muestra placeholder `--` o mensaje sutil y no genera porcentajes ni discos

### Requirement: Entradas de peso y reps con soporte de unidad
El sistema SHALL proveer dos campos superiores: `PESO (LB)` o `PESO (KG)` y `REPS`, inicializados con la unidad del `guest.preference.weightUnit` y valores por defecto (`225 lb / 100 kg` y `1 rep`). El cambio de unidad SHALL convertir el peso mostrado y recalcular el 1RM sin perder las reps.

#### Scenario: Cambio de unidad
- **WHEN** el usuario cambia de LB a KG
- **THEN** el peso se convierte via `convertWeight` y se re-renderiza `1RM` y porcentajes en la nueva unidad

#### Scenario: Validacion de reps
- **WHEN** REPS supera 30 o es decimal
- **THEN** el sistema lo clamp/round a entero 1..30 o muestra error inline segun validacion y no calcula porcentajes hasta corregir

### Requirement: Tabla de porcentajes derivada del 1RM
El sistema SHALL renderizar la seccion `PORCENTAJES` como lista scrollable con filas `% -> peso` calculadas como `peso = 1RM * porcentaje/100`, redondeadas con `roundWeight`, orden descendente dentro del rango del mockup (por defecto `110%` a `30%` o `70%` minimo). Cada fila SHALL mostrar `%` en Ember, `peso` en grande con unidad `lb/kg` pequena, y chevron `>` a la derecha, mas el hint superior `-- TOCA UNA FILA PARA VER LOS DISCOS --`.

#### Scenario: Tabla inicial con 1RM 225 lb e incremento 5%
- **WHEN** 1RM=225 y incremento=5%
- **THEN** la tabla muestra filas `110% = 248 lb`, `105% = 236 lb`, `100% = 225 lb`, `95% = 214 lb`, `90% = 203 lb`, `85% = 191 lb` (valores del mockup redondeados) y continua hasta el minimo

#### Scenario: Actualizacion reactiva
- **WHEN** el usuario edita PESO o REPS y cambia el 1RM
- **THEN** todas las filas recalculan su peso en <150ms sin recargar pagina

#### Scenario: Sin 1RM valido
- **WHEN** no hay 1RM estimado
- **THEN** la tabla muestra estado vacio o filas deshabilitadas con `--`

### Requirement: Selector de incremento de porcentaje
El sistema SHALL proveer un control pill `5%` (valor por defecto) en el header de la seccion PORCENTAJES que al tocar abre un bottom-sheet/modal `Incremento de porcentaje` con opciones `1%, 2%, 5%, 10%, 15%`, marca `check` en la seleccion actual, y botones `Cancelar` y `Listo`.

#### Scenario: Abrir selector
- **WHEN** el usuario toca el pill `5%`
- **THEN** se abre el modal con las 5 opciones y el check en `5%`

#### Scenario: Cambiar incremento a 10%
- **WHEN** el usuario selecciona `10%` y toca `Listo`
- **THEN** el modal se cierra, el pill muestra `10%` y la tabla se regenera en saltos de 10% (ej. `110%,100%,90%...`)

#### Scenario: Cancelar sin guardar
- **WHEN** el usuario selecciona `2%` y toca `Cancelar` o backdrop/X
- **THEN** el modal se cierra y el incremento permanece en el valor previo, sin regenerar tabla

#### Scenario: Persistencia de incremento
- **WHEN** el guest vuelve a `/tools/barbell` en otra sesion
- **THEN** el incremento recordado (por guest) se restaura; si no hay valor guardado, default `5%`

### Requirement: Visualizacion de discos al tocar fila de porcentaje
El sistema SHALL abrir un modal de visualizacion al tocar cualquier fila de la tabla. El modal SHALL mostrar: encabezado con `%` en Ember y `peso` teorico, grafico de barra horizontal con discos apilados por lado (colores por denominacion), y si el peso no es exactamente cargable con el inventario, texto `Peso mas cercano posible: X lb/kg` (valor `achieved` de `calculatePlates`). Boton `X` cierra el modal. Tocar backdrop tambien cierra.

#### Scenario: Peso exacto 100% = 225 lb con barra 45 + inventario suficiente
- **WHEN** el usuario toca fila `100% 225 lb`
- **THEN** el modal muestra `100% 225 lb`, grafico con `2x 45 lb` por lado (azules), y no muestra texto de peso cercano alternativo o lo muestra igual `225 lb` sin discrepancia

#### Scenario: Peso no cargable 105% = 236 lb con inventario limitado
- **WHEN** el usuario toca fila `105% 236 lb` y el inventario solo permite `235 lb` (ej. 2x45 + 1x5 por lado)
- **THEN** el modal muestra grafico con `2x45` + `1x5` por lado y texto `Peso mas cercano posible: 235 lb`

#### Scenario: Cierre de modal
- **WHEN** el usuario toca `X` o el backdrop
- **THEN** el modal se cierra y vuelve la tabla de porcentajes sin perder estado de inputs ni scroll

### Requirement: Configuracion de inventario de barra y discos
El sistema SHALL proveer acceso via icono engranaje (top-right) a pantalla/modal `INVENTARIO DE PESOS` con: campo `PESO DE LA BARRA` (input numerico con sufijo LB/KG, default `45`/`20` segun unidad, descripcion `Peso de la barra vacia, usado para el calculo de los discos.`) y seccion `PARES DE DISCOS DISPONIBLES` listando denominaciones por unidad (`KG: 25,20,15,10,5,2.5,1.25,1,0.5` / `LB: 55,45,35,25,15,10,5,2.5,1.25,1`) cada una con fila `X lb/kg | - | N pares | +` donde `-` decrementa, `+` incrementa, mostrando `0 pares` a `5 pares` por defecto segun mockup (extremos 55/1.25 en 0, medias en 5). Controles SHALL deshabilitar `-` en 0 y `+` en un maximo configurable (ej. 10) y actualizar en tiempo real.

#### Scenario: Editar peso de barra
- **WHEN** el usuario cambia `PESO DE LA BARRA` de `45` a `35 lb`
- **THEN** todos los calculos de `calculatePlates` usan `35` como base, y porcentajes/montajes se recalculan inmediatamente

#### Scenario: Ajustar inventario de discos
- **WHEN** el usuario toca `+` en fila `45 lb` de 5 a 6 pares o `-` de 0 permanece 0
- **THEN** el contador se actualiza, se persiste, y la visualizacion de discos en modales respeta el nuevo limite por tipo

#### Scenario: Navegacion a inventario y vuelta
- **WHEN** el usuario toca el engranaje desde `/tools/barbell`
- **THEN** navega a `/tools/barbell/inventory` (o abre sheet) y al cerrar/volver mantiene 1RM y scroll previo

### Requirement: Calculo de discos respeta inventario por pares
El sistema SHALL extender `calculatePlates` para aceptar `availablePairs: Map<peso, cantidadDePares>` y calcular `perSide` con greedy descendente limitado por disponibilidad por tipo. SHALL devolver `achieved`, `remainder` y `perSide` consistentes con inventario. Si no hay inventario registrado, SHALL usar comportamiento actual (ilimitado) como fallback.

#### Scenario: Calculo con inventario suficiente para objetivo
- **WHEN** objetivo `225 lb`, barra `45`, inventario `5 pares` de `45 lb`
- **THEN** `achieved = 225`, `perSide = [{45:2}]`, `remainder = 0`

#### Scenario: Calculo con inventario limitado obliga a peso cercano inferior
- **WHEN** objetivo `236 lb` con inventario limitado a `5` pares de `45,35,25,15,10,5,2.5` y sin discos de `1.25`
- **THEN** el sistema devuelve el maximo `achieved <= objetivo` alcanzable (ej. `235 lb`), con `remainder = 1` y `perSide` limitado

#### Scenario: Objetivo menor que barra
- **WHEN** objetivo `< pesoBarra`
- **THEN** `perSide = []`, `achieved = pesoBarra`, `totalPlates = 0` y UI muestra "Solo la barra"

### Requirement: Persistencia por guest
El sistema SHALL persistir por guest (via `Preference` o `localStorage` con fallback en cliente) al menos: `pesoBarra`, `paresPorDisco` (mapa), e `incrementoPorcentaje`. Al cargar `/tools/barbell` SHALL hidratar desde persistencia antes de renderizar. Si no hay valor, SHALL usar defaults del mockup.

#### Scenario: Hidratar inventario guardado
- **WHEN** un guest con inventario previo (`45 lb: 3 pares`, barra `35 lb`, incremento `10%`) visita `/tools/barbell`
- **THEN** los inputs y la tabla reflejan esos valores sin requerir re-ingreso

#### Scenario: Guest sin preferencia
- **WHEN** no hay Preference o es guest anonimo sin localStorage
- **THEN** el sistema usa defaults `bar=45/20`, `pares=5 medios/0 extremos`, `incremento=5%` y no falla

### Requirement: Estilo Forge Dark y accesibilidad mobile-first
La UI SHALL seguir Design.md (Forge Black `#0B0C10`, Surface `#15171D`, Card `#1C1F27`, Border `#343842`, Ember `#FF3D23`, Barlow Condensed para titulares uppercase, Inter para cuerpo), min-height 48px para targets tactiles, contraste AA, navegacion por teclado y estados foco visibles. Header `CALCULADORA DE BARRA` en Barlow ExtraBold uppercase centrado, con back `<` y engranaje settings.

#### Scenario: Render en mobile 390px
- **WHEN** se carga la pagina en viewport 390x844
- **THEN** se muestran 2 cards superiores (inputs y 1RM) apiladas, header con titulo centrado, pill `5%` con borde Ember, y filas con tipografia del mockup sin overflow horizontal

#### Scenario: Lectura por screen reader
- **WHEN** un lector recorre la tabla de porcentajes
- **THEN** cada fila tiene `aria-label` tipo "110 por ciento, 248 libras, toca para ver discos"

