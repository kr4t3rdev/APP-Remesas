import type React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsScreen";
import { ExpensesScreen } from "../screens/expenses/ExpensesScreen";
import { CashScreen } from "../screens/cash/CashScreen";
import type { MainTabParamList } from "./types";
import { mainTabDefinitions } from "./mainTabsConfig";
import { InstagramTabBar } from "./InstagramTabBar";
import { TabBarMotionProvider } from "./TabBarMotionProvider";

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabComponents: Record<keyof MainTabParamList, React.ComponentType> = {
	Home: HomeScreen,
	Transactions: TransactionsScreen,
	Cash: CashScreen,
	Expenses: ExpensesScreen,
	Profile: ProfileScreen,
};

export const MainTabs: React.FC = () => {
	return (
		<TabBarMotionProvider>
			<Tab.Navigator
				tabBar={(props) => <InstagramTabBar {...props} />}
				screenOptions={{
					headerShown: false,
					tabBarHideOnKeyboard: true,
				}}
			>
				{mainTabDefinitions.map(({ route, label }) => (
					<Tab.Screen
						key={route}
						name={route}
						component={tabComponents[route]}
						options={{
							tabBarLabel: label,
						}}
					/>
				))}
			</Tab.Navigator>
		</TabBarMotionProvider>
	);
};
