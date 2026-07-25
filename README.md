# Casa Muñoz · Gestor de Pedidos

Gestor para la bodega de huevo **Casa Muñoz** (Central de Abasto, CDMX), con el estilo
del letrero de la casa: crema, café y amarillo yema.

## Las tres pantallas

| Ruta | Qué es |
|---|---|
| `#inicio` | La bifurcación: **Pedidos** o **Dashboard** |
| `#pedidos` | Lista numerada del día. Botón **➕ Nuevo pedido** siempre fijo arriba. Cada pedido trae sus 4 botones de estado: *Solicitado → En proceso → Terminado → Entregado* |
| `#dashboard` | Tablero **Kanban** de 4 columnas. Los más próximos a salir, arriba. Un **Entregado** pasa a su columna, se despide 3 segundos y desaparece; la columna lleva la cuenta del día |

Un pedido **Entregado** se pone gris y bloqueado en la lista de Pedidos.

## Las dos tabletas

- Tableta del mostrador: abre `…/index.html#pedidos`
- Tableta de la nave: abre `…/index.html#dashboard`

Dos pestañas del mismo aparato se sincronizan solas al instante. Para que **aparatos
distintos** compartan los pedidos en vivo, se conecta Firebase (gratis): la config se
pega en `FIREBASE_CONFIG` dentro de `index.html`.

## Detalles

- Productos y precios editables dentro del programa («Editar productos»), por categoría
  **Huevo** y **Harina**. Si un precio está en 0, no se muestra.
- Las fuentes van incrustadas en el archivo: funciona hasta sin internet.
- Sin nube conectada, los datos viven en el navegador de cada aparato.
