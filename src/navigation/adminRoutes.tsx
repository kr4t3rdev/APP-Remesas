import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminServicesScreen from "../screens/admin/AdminServicesScreen";
import { AdminPlansListScreen } from "../screens/admin/plans/AdminPlansListScreen";
import { AdminPlanCreateScreen } from "../screens/admin/plans/AdminPlanCreateScreen";

const Stack = createNativeStackNavigator();

export const AdminRoutes = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminServicesList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AdminServicesList" component={AdminServicesScreen} />
      <Stack.Screen
        name="AdminPlansList"
        component={AdminPlansListScreen}
        options={{ headerTitle: "Planes de Suscripción" }}
      />
      <Stack.Screen
        name="AdminPlanCreate"
        component={AdminPlanCreateScreen}
        options={{ headerTitle: "Crear Plan" }}
      />
    </Stack.Navigator>
  );
};
