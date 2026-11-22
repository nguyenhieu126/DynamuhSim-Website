import { useCallback, useEffect, useRef, useState } from "react";
import { useRobot } from "../contexts/RobotContext";
export const directions = {
  w: [1, 0, 0],
  s: [-1, 0, 0],
  a: [0, 1, 0],
  d: [0, -1, 0],
  q: [0, 0, 1],
  e: [0, 0, -1],
} as const;
export type Direction = keyof typeof directions;
export function useManualControl(speed: number) {
  const { mode, owner, move, halt } = useRobot();
  const [active, setActive] = useState<Direction | null>(null);
  const held = useRef<Direction | null>(null);
  const moveRef = useRef(move);
  moveRef.current = move;
  const release = useCallback(() => {
    held.current = null;
    setActive(null);
    halt();
  }, [halt]);
  const press = useCallback(
    (key: Direction) => {
      if (mode !== "demo" || owner !== "manual") return;
      held.current = key;
      setActive(key);
    },
    [mode, owner],
  );
  useEffect(() => {
    const editable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName) ||
        target.isContentEditable);
    const down = (event: KeyboardEvent) => {
      if (
        editable(event.target) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      const key = event.key.toLowerCase();
      if (key in directions) {
        event.preventDefault();
        press(key as Direction);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === held.current) release();
    };
    const hidden = () => {
      if (document.hidden) release();
    };
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      release();
    };
  }, [press, release]);
  useEffect(() => {
    release();
  }, [mode, owner, release]);
  useEffect(() => {
    const tick = () => {
      const key = held.current;
      if (key) {
        const [x, y, z] = directions[key];
        moveRef.current({
          vx: (x * 0.8 * speed) / 100,
          vy: (y * 0.8 * speed) / 100,
          wz: (z * speed) / 100,
        });
      }
    };
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [speed]);
  return {
    active,
    press,
    release,
    enabled: mode === "demo" && owner === "manual",
  };
}
