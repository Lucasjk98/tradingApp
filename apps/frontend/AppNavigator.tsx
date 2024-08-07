import React from 'react';
import { Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import CryptoScreen from './screens/CryptoScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import TransactionsScreen from './screens/TransactionScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import GuideScreen from './screens/GuideScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Transactions',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Button
              onPress={() => navigation.goBack()}
              title="Back"
            />
          ),
        })}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Leaderboard',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Button
              onPress={() => navigation.goBack()}
              title="Back"
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileStack} />
        <Tab.Screen name="Crypto" component={CryptoScreen} />
        <Tab.Screen name="Portfolio" component={PortfolioScreen} />
        <Tab.Screen name="UserGuide" component={GuideScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
