/**
 * Convierte un timestamp en milisegundos a una cadena de fecha legible (YYYY-MM-DD HH:mm:ss) en la hora local.
 * @param timestamp - El timestamp en milisegundos (ej: 1745584363543).
 * @returns Una cadena de fecha formateada o un indicador de fecha inválida.
 */
export const formatTimestampManual = (timestamp: number): string => {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const pad = (num: number): string => (num < 10 ? "0" + num : String(num));

  return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(
    seconds
  )}`;
};

export const FormatUtils = { formatTimestampManual };
