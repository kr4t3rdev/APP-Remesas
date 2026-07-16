import { getTransactionsHeaderLayout } from "./transactionsHeaderLayout";

describe("getTransactionsHeaderLayout", () => {
  it("keeps the filter beside the title at regular phone sizes", () => {
    expect(getTransactionsHeaderLayout(430, 1)).toBe("inline");
  });

  it.each([
    [360, 1],
    [430, 1.35],
  ])("stacks the filter at width %s and font scale %s", (width, fontScale) => {
    expect(getTransactionsHeaderLayout(width, fontScale)).toBe("stacked");
  });
});
