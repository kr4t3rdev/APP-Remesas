import { Alert as NativeAlert, AlertButton, AlertOptions, Platform } from "react-native";
import { showError, showInfo, showSuccess } from "../store/toastStore";

const isWeb = Platform.OS === "web";

type ToastKind = "done" | "error" | "none";

const toast = (title: string, message?: string, kind: ToastKind = "done") => {
  const content = message ? `${title}: ${message}` : title;

  switch (kind) {
    case "error":
      isWeb ? require("sonner").toast.error(content) : showError(content);
      break;
    case "none":
      isWeb ? require("sonner").toast(content) : showInfo(content);
      break;
    default:
      isWeb ? require("sonner").toast.success(content) : showSuccess(content);
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

      toast(title, message, preset);
      return;
    }

    if (isWeb && typeof window !== "undefined" && window.confirm) {
      window.confirm(`${title}${message ? `: ${message}` : ""}`);
    } else {
      NativeAlert.alert(title, message, buttons, options);
    }
  },
};
