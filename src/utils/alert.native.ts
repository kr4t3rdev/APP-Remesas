import { Alert as NativeAlert, AlertButton, AlertOptions } from "react-native";
import { showError, showInfo, showSuccess } from "../store/toastStore";

type ToastKind = "done" | "error" | "none";

const toastNative = (title: string, message?: string, kind: ToastKind = "done") => {
  const content = message ? `${title}: ${message}` : title;

  switch (kind) {
    case "error":
      showError(content);
      break;
    case "none":
      showInfo(content);
      break;
    default:
      showSuccess(content);
      break;
  }
};

/**
 * @deprecated Use the custom ConfirmModal component for interactive confirmations (buttons).
 * Native alerts are mapped to the local toast store for informative messages.
 */
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) => {
    const isSimple =
      !buttons ||
      buttons.length === 0 ||
      (buttons.length === 1 &&
        (buttons[0].text?.toLowerCase() === "ok" ||
          buttons[0].text === "aceptar" ||
          buttons[0].text === "Aceptar") &&
        !buttons[0].onPress);

    if (isSimple) {
      const titleLower = title.toLowerCase();
      const messageLower = (message || "").toLowerCase();

      let preset: ToastKind = "done";

      if (
        titleLower.includes("error") ||
        messageLower.includes("error") ||
        titleLower.includes("falló") ||
        titleLower.includes("ups")
      ) {
        preset = "error";
      } else if (titleLower.includes("info") || titleLower.includes("aviso")) {
        preset = "none";
      }

      toastNative(title, message, preset);
      return;
    }

    NativeAlert.alert(title, message, buttons, options);
  },
};
