import React from "react";
import { StyleSheet } from "react-native";
import { render, within } from "@testing-library/react-native";
import { ObjectiveFormModal } from "./ObjectiveFormModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: jest.fn() }));

describe("ObjectiveFormModal layout", () => {
  beforeEach(() => jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 0, right: 0, bottom: 12, left: 0 }));

  it("anchors the sheet to the viewport bottom independently from keyboard layout", () => {
    const { getByTestId } = render(<ObjectiveFormModal visible onClose={jest.fn()} onSubmit={jest.fn()} />);
    const overlayStyle = StyleSheet.flatten(getByTestId("objective-modal-overlay").props.style);
    expect(overlayStyle).toEqual(expect.objectContaining({ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }));
    expect(overlayStyle).not.toHaveProperty("backgroundColor");
    const bottomAnchor = getByTestId("objective-modal-bottom-anchor");
    expect(StyleSheet.flatten(bottomAnchor.props.style)).toEqual(expect.objectContaining({ position: "absolute", right: 0, bottom: 0, left: 0 }));
    expect(within(bottomAnchor).getByTestId("objective-modal-keyboard-region")).toBeTruthy();
  });
});
