import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";

interface AppLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
  testID?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  style,
  testID,
}) => (
  <Image
    testID={testID}
    source={require("../../../assets/nucleo-icon.png")}
    resizeMode="contain"
    style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
    accessibilityRole="image"
    accessibilityLabel="Logo de APP Finance"
  />
);
