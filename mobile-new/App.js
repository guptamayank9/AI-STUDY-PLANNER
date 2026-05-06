import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider, useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { store } from "./src/store";
import { loadUser } from "./src/store/authSlice";

import LoginScreen          from "./src/screens/Auth/LoginScreen";
import RegisterScreen       from "./src/screens/Auth/RegisterScreen";
import DashboardScreen      from "./src/screens/Dashboard/DashboardScreen";
import ScheduleScreen       from "./src/screens/Schedule/ScheduleScreen";
import QuizScreen           from "./src/screens/Quiz/QuizScreen";
import ChatScreen           from "./src/screens/Chatbot/ChatScreen";
import NotificationScreen   from "./src/screens/Notifications/NotificationScreen";

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const THEME = { primary: "#4A90D9", dark: "#1E3A5F" };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: THEME.dark },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e2e8f0" },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard:     "home",
            Schedule:      "calendar",
            Quiz:          "sparkles",
            "AI Chat":     "chatbubble-ellipses",
            Notifications: "notifications",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"     component={DashboardScreen}    />
      <Tab.Screen name="Schedule"      component={ScheduleScreen}     />
      <Tab.Screen name="Quiz"          component={QuizScreen}         />
      <Tab.Screen name="AI Chat"       component={ChatScreen}         />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(loadUser()); }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen}    />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
