import React, { useCallback, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppearanceProvider } from './components/appearanceProvider';
import { Showcase } from './screens/showcase';
import {
  ModalBottomSheet,
  ScrollMode,
  SelectionMode,
  TimePicker
} from './screens/basic';
import { CardPickerExamples } from './screens/cardPickers';
import { AppProvider } from './contexts/internal';
import { Header } from './screens/showcase/Header';
import type { TextStyle, ViewStyle } from 'react-native';
import type { AppContextState } from './contexts/internal';
import type { AppStackParamsList } from './types';

const Stack = createStackNavigator<AppStackParamsList>();

export const App = () => {
  const [state, setState] = useState<AppContextState>({
    theme: 'light',
    toggleTheme: () => {}
  });

  const toggleTheme = useCallback(() => {
    setState((prev) => {
      return { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' };
    });
  }, []);

  const appContextVariables = useMemo(
    () => ({
      ...state,
      toggleTheme
    }),
    [state, toggleTheme]
  );

  const foregroundStyles = useMemo<TextStyle>(() => {
    return {
      color: state.theme === 'light' ? 'black' : 'white'
    };
  }, [state.theme]);

  const headerStyles = useMemo<ViewStyle>(() => {
    return {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor:
        state.theme === 'light'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.9)'
    };
  }, [state.theme]);

  return (
    <AppProvider value={appContextVariables}>
      <AppearanceProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Showcase"
            screenOptions={{
              headerStyle: headerStyles,
              headerTitleStyle: foregroundStyles,
              headerTintColor: foregroundStyles.color
            }}
          >
            <Stack.Screen
              name="Showcase"
              getComponent={() => Showcase}
              options={{
                header: Header
              }}
            />
            <Stack.Screen
              name="TimePicker"
              options={{
                title: 'Time Picker'
              }}
              getComponent={() => () => <TimePicker />}
            />
            <Stack.Screen
              name="CardPicker"
              options={{
                title: 'Card Picker'
              }}
              getComponent={() => () => <CardPickerExamples />}
            />
            <Stack.Screen
              name="SingleDaySelectionMode"
              options={{
                title: 'Selection Mode: Single Day'
              }}
              getComponent={() => () => (
                <SelectionMode selectionMode="singleDay" />
              )}
            />
            <Stack.Screen
              name="MultipleDaysSelectionMode"
              options={{
                title: 'Selection Mode: Multiple Days'
              }}
              getComponent={() => () => (
                <SelectionMode selectionMode="multipleDays" />
              )}
            />
            <Stack.Screen
              name="OneMonthScrollMode"
              options={{
                title: 'Scroll Mode: One Month'
              }}
              getComponent={() => () => <ScrollMode scrollMode="oneMonth" />}
            />
            <Stack.Screen
              name="MultipleMonthsScrollMode"
              options={{
                title: 'Scroll Mode: Multiple Months'
              }}
              getComponent={() => () => (
                <ScrollMode scrollMode="multipleMonths" />
              )}
            />
            <Stack.Screen
              name="AnyOffsetScrollMode"
              options={{
                title: 'Scroll Mode: Any Offset'
              }}
              getComponent={() => () => <ScrollMode scrollMode="anyOffset" />}
            />
            <Stack.Screen
              name="ModalBottomSheet"
              options={{
                title: 'Modal BottomSheet'
              }}
              getComponent={() => ModalBottomSheet}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppearanceProvider>
    </AppProvider>
  );
};
