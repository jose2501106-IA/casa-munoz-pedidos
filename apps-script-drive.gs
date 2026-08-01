/**
 * Casa Muñoz · Puente al Excel de Google Drive
 * ---------------------------------------------
 * Este código va DENTRO de tu hoja de cálculo de Google (Extensiones → Apps Script).
 * Crea y mantiene 3 pestañas:
 *   · Pedidos      → un renglón por pedido, se actualiza solo cuando cambia de estado
 *   · Movimientos  → bitácora de todo lo que pasa (auditoría)
 *   · Días         → un renglón por día: apertura, cierre, totales y tiempo promedio
 */

var COLS = ['Fecha', 'Corte', 'Folio', 'Cliente', 'Productos', 'Piezas', 'Total',
            'Hora pedido', 'Hora en proceso', 'Hora terminado', 'Hora entrega',
            'Minutos totales', 'Estado', 'Nota'];

var ETIQ = { solicitado: 'Solicitado', proceso: 'En proceso',
             terminado: 'Terminado', entregado: 'Entregado' };

/** Prueba de conexión: el botón «Probar» de la app llama aquí. */
function doGet(e) {
  hoja_('Pedidos', COLS);
  return ContentService.createTextOutput('ok — Casa Muñoz conectado');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var msg = JSON.parse(e.postData.contents);
    var d = msg.datos || {};

    if (msg.evento === 'pedido_nuevo' || msg.evento === 'cambio_estado') {
      guardarPedido_(d);
      bitacora_(msg.evento, d);
    } else if (msg.evento === 'dia_inicio') {
      hoja_('Días', ['Fecha', 'Corte', 'Inicio', 'Cierre', 'Pedidos', 'Entregados', 'Minutos promedio'])
        .appendRow([d.fecha, d.corte, d.inicio, '', '', '', '']);
      bitacora_('Día iniciado', d);
    } else if (msg.evento === 'dia_cierre') {
      cerrarDia_(d);
      bitacora_('Día cerrado', d);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  } finally {
    lock.releaseLock();
  }
}

/** Busca el pedido por Corte+Folio: si existe lo actualiza, si no lo agrega. */
function guardarPedido_(d) {
  var sh = hoja_('Pedidos', COLS);
  var fila = [d.fecha, d.corte, d.folio, d.cliente, d.productos, d.piezas, d.total,
              d.horaPedido, d.horaProceso, d.horaTerminado, d.horaEntrega,
              d.minutosTotal, ETIQ[d.estado] || d.estado, d.nota];
  var datos = sh.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][1]) === String(d.corte) && String(datos[i][2]) === String(d.folio)) {
      sh.getRange(i + 1, 1, 1, fila.length).setValues([fila]);
      return;
    }
  }
  sh.appendRow(fila);
}

function cerrarDia_(d) {
  var sh = hoja_('Días', ['Fecha', 'Corte', 'Inicio', 'Cierre', 'Pedidos', 'Entregados', 'Minutos promedio']);
  var datos = sh.getDataRange().getValues();
  for (var i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][1]) === String(d.corte)) {
      sh.getRange(i + 1, 4, 1, 4).setValues([[d.cierre, d.pedidos, d.entregados, d.promedioMin]]);
      return;
    }
  }
  sh.appendRow([d.fecha, d.corte, '', d.cierre, d.pedidos, d.entregados, d.promedioMin]);
}

function bitacora_(evento, d) {
  hoja_('Movimientos', ['Momento', 'Evento', 'Folio', 'Cliente', 'Estado', 'Detalle'])
    .appendRow([new Date(), evento, d.folio || '', d.cliente || '',
                ETIQ[d.estado] || d.estado || '', JSON.stringify(d)]);
}

/** Devuelve la pestaña; la crea con encabezados si no existe. */
function hoja_(nombre, encabezados) {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var sh = libro.getSheetByName(nombre);
  if (!sh) {
    sh = libro.insertSheet(nombre);
    sh.appendRow(encabezados);
    sh.getRange(1, 1, 1, encabezados.length)
      .setFontWeight('bold').setBackground('#F5A623').setFontColor('#3B2314');
    sh.setFrozenRows(1);
  }
  return sh;
}
