import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useRobot } from "../contexts/RobotContext";
/** A route change cancels control authority; focusing again never resumes it. */
export function useDeadman() {
  const { revoke } = useRobot();
  useFocusEffect(useCallback(() => () => revoke(), [revoke]));
}
