import { calculateTransferPreview, Position } from "./business";

const reviewedPosition: Position = {
  currencyId: 2,
  saldo: 100,
  costoPromedio: 250,
  availableForSale: true,
};

describe("calculateTransferPreview", () => {
  it("projects weighted average cost for a purchase", () => {
    const preview = calculateTransferPreview({ type: "COMPRA", amount: 50, rate: 260, position: reviewedPosition });
    expect(preview.currentSaldo).toBe(100);
    expect(preview.currentCostoPromedio).toBe(250);
    expect(preview.projectedSaldo).toBe(150);
    expect(preview.projectedCostoPromedio).toBeCloseTo(253.3333, 3);
    expect(preview.totalBase).toBe(13000);
  });

  it("blocks an unavailable or insufficient sale and does not project a valid effect", () => {
    const preview = calculateTransferPreview({ type: "VENTA", amount: 125, rate: 270, position: reviewedPosition });
    expect(preview.currentSaldo).toBe(100);
    expect(preview.currentCostoPromedio).toBe(250);
    expect(preview.isValid).toBe(false);
    expect(preview.validationMessage).toContain("saldo disponible");
    expect(preview.projectedSaldo).toBeNull();
    expect(preview.expectedRendimiento).toBeNull();
  });

  it("calculates realized performance for a valid sale", () => {
    const preview = calculateTransferPreview({ type: "VENTA", amount: 50, rate: 270, position: reviewedPosition });
    expect(preview.isValid).toBe(true);
    expect(preview.projectedSaldo).toBe(50);
    expect(preview.expectedRendimiento).toBe(1000);
  });
});
