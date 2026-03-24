import { Alert as NativeAlert, AlertButton, AlertOptions } from "react-native";
import * as Burnt from "burnt";

/**
 * @deprecated Use the custom ConfirmModal component for interactive confirmations (buttons).
 * This utility now maps simple informative alerts to Burnt Toast notifications.
 * If multiple buttons are provided, it will fallback to NativeAlert.alert, but this is discouraged.
 */
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) => {
    // Determine if it's a simple alert (no buttons, or just an 'OK' button without custom onPress)
    const isSimple =
      !buttons ||
      buttons.length === 0 ||
      (buttons.length === 1 &&
        (buttons[0].text?.toLowerCase() === "ok" ||
          buttons[0].text === "aceptar" ||
          buttons[0].text === "Aceptar") &&
        !buttons[0].onPress);

    if (isSimple) {
      // Determine preset based on title/message
      const titleLower = title.toLowerCase();
      const messageLower = (message || "").toLowerCase();

      let preset: "done" | "error" | "none" = "done";

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

      Burnt.toast({
        title: title,
        message: message,
        preset: preset,
        duration: 3,
      });
      return;
    }

    // Fallback to Native Alert for confirmations
    NativeAlert.alert(title, message, buttons, options);
  },
};
