import { Tabs } from "expo-router/js-tabs";
export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false }}
      tabBar={() => null}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="control" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="ai" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
