import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ToastContainer } from "./src/components/ui";
import { WebToaster } from "./src/components/ui/WebToaster";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

function AppRoot() {
	return (
		<>
			<StatusBar barStyle="dark-content" />
			<ToastContainer />
			<WebToaster />
			<AppNavigator />
		</>
	);
}

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<AppRoot />
				</QueryClientProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
