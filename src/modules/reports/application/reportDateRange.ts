const MAX_REPORT_RANGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getReportRangeError(start: string, end: string): string | null {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return "Seleccioná fechas válidas";
  }
  if (startTime > endTime) {
    return "La fecha desde debe ser anterior o igual a la fecha hasta";
  }
  if (Math.ceil((endTime - startTime) / DAY_MS) > MAX_REPORT_RANGE_DAYS) {
    return "El período no puede exceder 30 días";
  }
  return null;
}

export const isReportRangeValid = (start: string, end: string): boolean =>
  getReportRangeError(start, end) === null;
