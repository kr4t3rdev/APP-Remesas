import { AlertButton, AlertOptions } from "react-native";
import { toast as webToast } from "sonner";

type ToastKind = "done" | "error" | "none";

const toastWeb = (title: string, message?: string, kind: ToastKind = "done") => {
  const content = message ? `${title}: ${message}` : title;

  switch (kind) {
    case "error":
      webToast.error(content);
      break;
    case "none":
      webToast(content);
      break;
    default:
      webToast.success(content);
      break;
  }
};

/**
 * @deprecated Use the custom ConfirmModal component for interactive confirmations (buttons).
 * Web alerts are mapped to Sonner toasts.
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

      toastWeb(title, message, preset);
      return;
    }

    // For web confirmation dialogs, keep native alert fallback behavior
    // only if it is actually available in the runtime.
    if (typeof window !== "undefined" && window.confirm) {
      window.confirm(`${title}${message ? `: ${message}` : ""}`);
    }
  },
};
