import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";

type UserAvatarUser = {
  name: string;
  avatarUrl?: string | null;
};

type UserAvatarProps = {
  user: UserAvatarUser;
  size?: number;
};

const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#A855F7", // Purple
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "?";

  const parts = name.trim().split(/\s+/);
  const firstInitial = parts[0]?.charAt(0) || "";
  const lastInitial =
    parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";

  const initials = (firstInitial + lastInitial).toUpperCase();
  return initials.length > 0 ? initials : "?";
}

function getBackgroundColor(name: string): string {
  const hash = hashString(name);
  const index = hash % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 40 }) => {
  const initials = getInitials(user.name);
  const backgroundColor = getBackgroundColor(user.name);
  const avatarUrl = user.avatarUrl;
  const hasAvatar = avatarUrl && avatarUrl.trim().length > 0;

  if (hasAvatar && avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.initialsContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E2E8F0",
  },
  initialsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
});
