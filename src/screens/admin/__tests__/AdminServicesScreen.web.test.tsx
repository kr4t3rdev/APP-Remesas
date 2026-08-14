import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AdminServicesScreen } from "../AdminServicesScreen.web";

jest.mock("../../../api/adminMetricsApi", () => ({ fetchAdminMetrics: jest.fn().mockResolvedValue({ activeCount: 12, expiredCount: 2, activeDelta: "+8%", expiredDelta: "-2%" }) }));
jest.mock("../../../store/themeStore", () => ({ useColors: jest.fn(() => ({ background: "#f6f8fb", card: "#fff", border: "#dbe3ed", text: { primary: "#172033", secondary: "#617087", tertiary: "#8b98aa", inverse: "#fff" }, primary: { 500: "#2563eb" }, success: "#15803d", warning: "#b45309", danger: "#b91c1c" })) }));

describe("AdminServicesScreen web surface", () => {
  it("renders service health and management actions", async () => {
    const { findByText, getByText } = render(<NavigationContainer><AdminServicesScreen /></NavigationContainer>);
    expect(getByText("Servicios y planes")).toBeTruthy();
    expect(getByText("Gestión principal")).toBeTruthy();
    expect(getByText("Licencias")).toBeTruthy();
    expect(await findByText("12")).toBeTruthy();
  });
});
