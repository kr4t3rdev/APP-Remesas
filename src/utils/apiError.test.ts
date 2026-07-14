import { getApiErrorMessage } from "./apiError";

describe("getApiErrorMessage", () => {
  it("maps an aborted request to a friendly timeout message", () => {
    expect(getApiErrorMessage({ name: "AbortError", message: "Aborted" })).toBe(
      "La solicitud tardó demasiado. Comprueba tu conexión e inténtalo de nuevo.",
    );
  });
});
