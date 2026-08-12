import React from "react";
import { Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { BREAKPOINTS, useResponsive } from "../hooks/useResponsive";
import { Sidebar } from "../components/layout/Sidebar";
import { InstagramTabBar } from "./InstagramTabBar";

export type ResponsiveTabBarProps = BottomTabBarProps & {
	isAdmin?: boolean;
	hideHeaderLogo?: boolean;
};

export const ResponsiveTabBar: React.FC<ResponsiveTabBarProps> = ({
	isAdmin = false,
	hideHeaderLogo = false,
	...tabBarProps
}) => {
	const { width } = useResponsive();
	const isWebDesktop =
		Platform.OS === "web" && width >= BREAKPOINTS.tablet;

	if (isWebDesktop) {
		return <Sidebar isAdmin={isAdmin} hideHeaderLogo={hideHeaderLogo} />;
	}

	return <InstagramTabBar {...tabBarProps} />;
};

export default ResponsiveTabBar;
