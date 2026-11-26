import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";
import { JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono/700Bold";
import { ThemeProvider, useTheme } from "../src/contexts/ThemeContext";
import { RobotProvider } from "../src/contexts/RobotContext";
import {
  AppHeader,
  BottomNavigation,
  DemoBanner,
  Notice,
} from "../src/components/common/AppShell";
export const unstable_settings = { anchor: "(tabs)" };
function Shell() {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 8 }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppHeader />
      <DemoBanner />
      <Notice />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sensors" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
}
export default function Layout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0b1326",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#00c2d6" />
        <Text style={{ color: "#dae2fd", marginTop: 12 }}>Loading PBL6…</Text>
      </View>
    );
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RobotProvider>
          <Shell />
        </RobotProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
