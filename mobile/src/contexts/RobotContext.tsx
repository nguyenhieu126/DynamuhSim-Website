import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useRef,
  useCallback,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  controlReducer,
  initialControl,
  validateSettings,
} from "../services/demoControl";
import { defaultSettings, type LocalSettings } from "../data/demo";
import type { RobotVelocity } from "../types/robot";
function useRobotValue() {
  const [control, dispatch] = useReducer(controlReducer, initialControl);
  const [settings, setSettings] = useState(defaultSettings);
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const release = useCallback(() => {
    clear();
    dispatch({ type: "release" });
  }, [clear]);
  const revoke = useCallback(() => {
    clear();
    dispatch({ type: "blur" });
  }, [clear]);
  const move = useCallback(
    (velocity: RobotVelocity) => {
      dispatch({ type: "move", velocity });
      clear();
      timer.current = setTimeout(() => dispatch({ type: "timeout" }), 500);
    },
    [clear],
  );
  const stop = () => {
    clear();
    dispatch({ type: "stop" });
    setNotice(
      "Local preview stopped. No physical STOP was sent. Hardware acknowledgment is unavailable.",
    );
  };
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        clear();
        dispatch({ type: "background" });
      }
    });
    return () => {
      sub.remove();
      clear();
    };
  }, [clear]);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("pbl6-mobile-settings")
      .then((v) => {
        if (!v) return;
        try {
          const parsed = JSON.parse(v);
          const merged = { ...defaultSettings, ...parsed };
          if (active && !validateSettings(merged)) setSettings(merged);
        } catch {}
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const saveSettings = async (s: LocalSettings) => {
    const error = validateSettings(s);
    if (error) {
      setNotice(error);
      return false;
    }
    try {
      await AsyncStorage.setItem("pbl6-mobile-settings", JSON.stringify(s));
      setSettings(s);
      setNotice(
        "Saved on this device only. No backend or hardware configuration changed.",
      );
      return true;
    } catch {
      setNotice("Device storage is unavailable. Settings were not saved.");
      return false;
    }
  };
  return {
    control,
    dispatch,
    move,
    release,
    revoke,
    stop,
    settings,
    saveSettings,
    notice,
    setNotice,
  };
}
type RobotValue = ReturnType<typeof useRobotValue>;
const Context = createContext<RobotValue | null>(null);
export function RobotProvider({ children }: PropsWithChildren) {
  return (
    <Context.Provider value={useRobotValue()}>{children}</Context.Provider>
  );
}
export function useRobot() {
  const v = useContext(Context);
  if (!v) throw new Error("RobotProvider missing");
  return v;
}
