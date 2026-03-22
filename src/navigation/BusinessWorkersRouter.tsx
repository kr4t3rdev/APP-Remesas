import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View } from 'react-native';
import WorkersScreen from '../screens/business/workers/WorkersScreen';
import type { RootStackParamList } from './types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UIWorkersRedirectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    navigation.navigate('BusinessWorkers');
  }, [navigation]);

  return <View />;
};

export const BusinessWorkersScreen: React.FC = () => {
  return <WorkersScreen />;
};

export const UIWorkersRedirect: React.FC = () => {
  return <UIWorkersRedirectScreen />;
};

const BusinessWorkersRouter: React.FC = () => {
  return <WorkersScreen />;
};

export default BusinessWorkersRouter;
