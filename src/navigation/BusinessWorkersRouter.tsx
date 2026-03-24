import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";
import type { RootStackParamList } from "./types";
import { WorkerPaymentsScreen } from "../screens/worker-payments/WorkerPaymentsScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UIWorkersRedirectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    navigation.navigate("BusinessWorkers");
  }, [navigation]);

  return <View />;
};

export const BusinessWorkersScreen: React.FC = () => {
  return <WorkerPaymentsScreen />;
};

export const UIWorkersRedirect: React.FC = () => {
  return <UIWorkersRedirectScreen />;
};

const BusinessWorkersRouter: React.FC = () => {
  return <WorkerPaymentsScreen />;
};

export default BusinessWorkersRouter;
