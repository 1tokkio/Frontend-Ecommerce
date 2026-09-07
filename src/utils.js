const formateadorPeso = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
});

export function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return '-';
  return formateadorPeso.format(valor);
}

export function formatearFecha(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
}
