import React from "react";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import { View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Label, Row } from "../common/UI";
export function TelemetryChart({
  angular = false,
  range = "10s",
}: {
  angular?: boolean;
  range?: string;
}) {
  const { colors } = useTheme();
  const traces = [colors.cyan, "#60a5fa", colors.purple];
  const factor: Record<string, number> = {
    "10s": 1,
    "1m": 1.5,
    "5m": 2.2,
    "15m": 3,
    "1h": 4,
  };
  const f = factor[range] ?? 1;
  const lines = Array.from({ length: 3 }, (_, k) =>
    Array.from(
      { length: 40 },
      (_, i) =>
        `${30 + i * 7},${angular ? 62 + Math.sin(i * 0.25 * f + k * 2) * 20 : k === 2 ? 24 : 88 + Math.sin(i * 0.2 * f + k) * 2}`,
    ).join(" "),
  );
  return (
    <View
      accessibilityLabel={`Simulated ${angular ? "angular velocity" : "acceleration"} chart, ${range}`}
      style={{
        backgroundColor: colors.inset,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Svg viewBox="0 0 320 138" width="100%" height={138}>
        {[24, 56, 88, 116].map((y, i) => (
          <React.Fragment key={y}>
            <Line
              x1={28}
              x2={310}
              y1={y}
              y2={y}
              stroke={colors.border}
              strokeDasharray="3 4"
            />
            <SvgText x={3} y={y + 4} fill={colors.muted} fontSize={9}>
              {angular
                ? [".04", ".00", "-.04", ""][i]
                : ["12", "8", "0", "-4"][i]}
            </SvgText>
          </React.Fragment>
        ))}
        {lines.map((points, k) => (
          <Polyline
            key={k}
            points={points}
            fill="none"
            stroke={traces[k]}
            strokeWidth={1.8}
          />
        ))}
        <SvgText x={30} y={133} fill={colors.muted} fontSize={9}>
          {range} · simulated history
        </SvgText>
        <SvgText x={276} y={133} fill={colors.muted} fontSize={9}>
          now
        </SvgText>
      </Svg>
      <Row style={{ justifyContent: "flex-end", padding: 6 }}>
        {traces.map((c, k) => (
          <Label key={k} size={10} mono color={c}>
            ● {angular ? "ω" : "a"}
            {"xyz"[k]}
          </Label>
        ))}
      </Row>
    </View>
  );
}
