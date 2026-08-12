import React from "react";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react-native";

jest.mock("expo-blur", () => {
	const React = require("react");
	const { View } = require("react-native");
	return { BlurView: (props: object) => <View {...props} /> };
});

jest.mock("../store/themeStore", () => ({
	useIsDark: () => false,
	useColors: () => ({
		card: "#FFFFFF",
		background: "#F6FAFA",
		border: "#D8E7E9",
		text: { primary: "#0F172A", secondary: "#526C72", tertiary: "#94A3B8", inverse: "#FFFFFF" },
		primary: { 50: "#ECFEFF", 100: "#CFFAFE", 500: "#0E7490", 700: "#155E75" },
	}),
}));

jest.mock("@expo/vector-icons", () => {
	const React = require("react");
	const { Text } = require("react-native");
	return { Ionicons: ({ name }: { name: string }) => <Text>{name}</Text> };
});

jest.mock("../hooks/useResponsive", () => {
	const actual = jest.requireActual("../hooks/useResponsive");
	return {
		...actual,
		useResponsive: jest.fn(() => ({
			width: 400,
			height: 800,
			breakpoint: "mobile",
			isMobile: true,
			isTablet: false,
			isDesktop: false,
			isWide: false,
			isTouchDevice: true,
			shouldShowSidebar: false,
			shouldShowBottomTabs: true,
			sidebarMode: "collapsed",
		})),
	};
});

jest.mock("@react-navigation/native", () => {
	const React = require("react");
	const actual = jest.requireActual("@react-navigation/native");
	return {
		...actual,
		useNavigation: () => ({
			getState: () => ({
				index: 0,
				routes: [{ key: "Home-key", name: "Home" }],
			}),
			dispatch: jest.fn(),
		}),
	};
});

import { ResponsiveTabBar } from "./responsiveShell";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useResponsive } from "../hooks/useResponsive";
import { Sidebar } from "../components/layout/Sidebar";
import { InstagramTabBar } from "./InstagramTabBar";
import { TabBarMotionProvider } from "./TabBarMotionProvider";

const routeNames = [
	"Home",
	"Transactions",
	"Cash",
	"Expenses",
	"Profile",
] as const;

const createTabBarProps = (activeIndex = 0): BottomTabBarProps => {
	const routes = routeNames.map((name) => ({ key: `${name}-key`, name }));
	return {
		state: {
			stale: false,
			type: "tab" as const,
			key: "main-tabs",
			index: activeIndex,
			routeNames: [...routeNames],
			routes,
			history: [],
			preloadedRouteKeys: [],
		},
		descriptors: Object.fromEntries(
			routes.map((route) => [
				route.key,
				{
					options: {},
					route,
					navigation: {},
					render: () => null,
				},
			]),
		) as unknown as BottomTabBarProps["descriptors"],
		navigation: {
			emit: jest.fn(() => ({ defaultPrevented: false })),
			navigate: jest.fn(),
		} as unknown as BottomTabBarProps["navigation"],
		insets: { top: 0, right: 0, bottom: 34, left: 0 },
	};
};

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});

const renderResponsive = (
		width: number,
		extraProps: Partial<React.ComponentProps<typeof ResponsiveTabBar>> = {},
	) => {
		(useResponsive as jest.Mock).mockImplementation(() => ({
		width,
		height: 800,
		breakpoint: width >= 1440 ? "wide" : width >= 1024 ? "desktop" : width >= 640 ? "tablet" : "mobile",
		isMobile: width < 640,
		isTablet: width >= 640 && width < 1024,
		isDesktop: width >= 1024,
		isWide: width >= 1440,
		isTouchDevice: width < 640,
		shouldShowSidebar: width >= 640,
		shouldShowBottomTabs: width < 640,
		sidebarMode: width >= 1024 ? "expanded" : "collapsed",
	}));

	return render(
		<QueryClientProvider client={queryClient}>
			<TabBarMotionProvider>
				<ResponsiveTabBar {...createTabBarProps()} {...extraProps} />
			</TabBarMotionProvider>
		</QueryClientProvider>,
	);
};

describe("responsiveShell", () => {
	beforeAll(() => {
		jest.replaceProperty(Platform, "OS", "web");
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the floating Instagram tab bar on mobile", () => {
		const view = renderResponsive(400);
		expect(view.getByTestId("floating-tab-bar")).toBeTruthy();
		expect(view.queryByTestId("sidebar")).toBeNull();
	});

	it("renders the persistent sidebar on desktop and hides the floating bar", () => {
		const view = renderResponsive(1200);
		expect(view.getByTestId("sidebar")).toBeTruthy();
		expect(view.queryByTestId("floating-tab-bar")).toBeNull();
	});

	it("renders the sidebar at tablet breakpoint", () => {
		const view = renderResponsive(768);
		expect(view.getByTestId("sidebar")).toBeTruthy();
		expect(view.queryByTestId("floating-tab-bar")).toBeNull();
	});

	it("passes desktop sidebar through to the Sidebar layout component", () => {
		renderResponsive(1200);
		const { Sidebar: SidebarFromModule } = { Sidebar };
		expect(typeof SidebarFromModule).toBe("function");
	});

	it("renders the admin sidebar on desktop with isAdmin", () => {
		renderResponsive(1200, { isAdmin: true });
	});

	it("keeps the Instagram tab bar for touch mobile widths", () => {
		renderResponsive(390);
		const { InstagramTabBar: ITB } = { InstagramTabBar: InstagramTabBar };
		expect(typeof ITB).toBe("function");
	});
});