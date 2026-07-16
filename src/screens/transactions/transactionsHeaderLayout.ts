export type TransactionsHeaderLayout = "inline" | "stacked";

const STACKED_HEADER_MAX_WIDTH = 379;
const STACKED_HEADER_MIN_FONT_SCALE = 1.3;

export const getTransactionsHeaderLayout = (
  width: number,
  fontScale: number,
): TransactionsHeaderLayout =>
  width <= STACKED_HEADER_MAX_WIDTH || fontScale >= STACKED_HEADER_MIN_FONT_SCALE
    ? "stacked"
    : "inline";
