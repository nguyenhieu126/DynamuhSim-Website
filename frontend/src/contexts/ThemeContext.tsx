import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const ThemeContext = createContext({
  theme: "light",
  setTheme: (_: string) => {},
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("pbl6-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("pbl6-theme", theme);
    } catch {
      /* The theme still works for this session. */
    }
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
