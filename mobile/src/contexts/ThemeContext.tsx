import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dark, light, type Palette } from "../theme/tokens";
export type ThemeChoice = "light" | "dark" | "system";
const Context = createContext<{
  colors: Palette;
  isDark: boolean;
  theme: ThemeChoice;
  setTheme: (v: ThemeChoice) => void;
}>({ colors: dark, isDark: true, theme: "dark", setTheme: () => {} });
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [theme, setValue] = useState<ThemeChoice>("dark");
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("pbl6-mobile-theme")
      .then((v) => {
        if (active && (v === "light" || v === "dark" || v === "system"))
          setValue(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const setTheme = (v: ThemeChoice) => {
    setValue(v);
    void AsyncStorage.setItem("pbl6-mobile-theme", v).catch(() => {});
  };
  const isDark = theme === "dark" || (theme === "system" && system === "dark");
  return (
    <Context.Provider
      value={{ colors: isDark ? dark : light, isDark, theme, setTheme }}
    >
      {children}
    </Context.Provider>
  );
}
export const useTheme = () => useContext(Context);
