import React, { useState, useMemo, useRef } from "react";
import { View, PanResponder } from "react-native";
import Svg, {
  G,
  Rect,
  Path,
  Polyline,
  Circle,
  Polygon,
  Line,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "../../contexts/ThemeContext";
import { Action, Badge, Label, SectionCard } from "../common/UI";
import { LidarPlot } from "../robot/Telemetry";
export function MapPanel({
  controls = false,
  goal = false,
  lidar = false,
}: {
  controls?: boolean;
  goal?: boolean;
  lidar?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0 });
  const gesture = useMemo(() => {
    // PanResponder stores callbacks; this ref is only accessed by native gesture events.
    // eslint-disable-next-line react-hooks/refs
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) + Math.abs(g.dy) > 7,
      onPanResponderGrant: () => {
        setPan((p) => {
          start.current = p;
          return p;
        });
      },
      onPanResponderMove: (_, g) =>
        setPan({
          x: Math.max(-60, Math.min(60, start.current.x + g.dx / 2)),
          y: Math.max(-60, Math.min(60, start.current.y + g.dy / 2)),
        }),
      onPanResponderRelease: () => {},
      onPanResponderTerminationRequest: () => true,
    });
  }, []);
  return (
    <SectionCard style={{ padding: 8 }}>
      <View
        {...(controls ? gesture.panHandlers : {})}
        accessibilityLabel="Illustrative occupancy map. Drag to pan."
        style={{
          height: controls ? 290 : 215,
          overflow: "hidden",
          borderRadius: 8,
          backgroundColor: "#8b93a3",
        }}
      >
        {lidar ? (
          <LidarPlot />
        ) : (
          <Svg viewBox="0 0 330 255" width="100%" height="100%">
            {Array.from({ length: 18 }, (_, i) => (
              <React.Fragment key={i}>
                <Line
                  x1={i * 20}
                  x2={i * 20}
                  y1={0}
                  y2={255}
                  stroke="#738095"
                  strokeWidth={0.4}
                />
                <Line
                  y1={i * 20}
                  y2={i * 20}
                  x1={0}
                  x2={330}
                  stroke="#738095"
                  strokeWidth={0.4}
                />
              </React.Fragment>
            ))}
            <G
              transform={`translate(${pan.x} ${pan.y}) translate(165 127) scale(${zoom}) translate(-165 -127)`}
            >
              <Path
                d="M30 58H121V25H206V55H237V95H302V193H230V222H192V204H147V232H110V197H30Z"
                fill="#f2f6fc"
                stroke="#0d182b"
                strokeWidth={5}
              />
              {[
                [52, 80],
                [143, 111],
                [255, 148],
                [85, 167],
              ].map(([x, y], i) => (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={18}
                  height={16}
                  fill="#15233a"
                />
              ))}
              <Polyline
                points={
                  goal
                    ? "60,170 115,145 180,109 202,55"
                    : "60,170 118,144 166,110 200,58"
                }
                fill="none"
                stroke="#05c883"
                strokeWidth={2}
              />
              <Polyline
                points="60,170 93,120 150,91 200,58"
                fill="none"
                stroke="#00b8ef"
                strokeDasharray="3 3"
              />
              <Circle cx={60} cy={170} r={12} fill="#1769e033" />
              <Polygon points="51,165 70,170 56,181" fill="#1769e0" />
              <Circle
                cx={200}
                cy={58}
                r={7}
                fill="none"
                stroke="#00c2d6"
                strokeWidth={2}
              />
              <SvgText x={210} y={55} fontSize={10} fill="#00677c">
                G
              </SvgText>
              {Array.from({ length: 20 }, (_, i) => (
                <Circle
                  key={i}
                  cx={32 + i * 13}
                  cy={i % 2 ? 59 : 195}
                  r={1.1}
                  fill="#ef4444"
                />
              ))}
            </G>
          </Svg>
        )}
        {controls && (
          <View style={{ position: "absolute", right: 4, top: 4, gap: 4 }}>
            <Action
              accessibilityLabel="Zoom in map"
              onPress={() => setZoom((z) => Math.min(2, z + 0.2))}
              icon="add"
            />
            <Action
              accessibilityLabel="Zoom out map"
              onPress={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              icon="remove"
            />
            <Action
              accessibilityLabel="Reset map view"
              onPress={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              icon="locate-outline"
            />
          </View>
        )}
        <View style={{ position: "absolute", bottom: 6, left: 6 }}>
          <Badge>DEMO map · Illustrative path</Badge>
        </View>
      </View>
      {controls && (
        <Label size={11} muted style={{ marginTop: 8 }}>
          □ Free space ▪ Wall ▪ Unknown ● LiDAR{"\n"}▲ Pose ━ Trajectory ┄ Plan
          ○ Goal · drag to pan
        </Label>
      )}
    </SectionCard>
  );
}
export function DangerSectors() {
  const { colors } = useTheme();
  return (
    <SectionCard title="Top View · Robot Danger Sectors" icon="radio-outline">
      <Svg viewBox="0 0 320 160" width="100%" height={160}>
        <Path d="M20 144 A140 140 0 0 1 300 144L160 144Z" fill="#10b98122" />
        <Path d="M55 144 A105 105 0 0 1 265 144L160 144Z" fill="#f59e0b33" />
        <Path d="M95 144 A65 65 0 0 1 225 144L160 144Z" fill="#ef444433" />
        <Line x1={160} x2={160} y1={10} y2={150} stroke={colors.border} />
        <Circle cx={137} cy={107} r={8} fill="#ef4444" />
        <Circle cx={216} cy={66} r={8} fill="#10b981" />
        <Circle cx={241} cy={108} r={7} fill="#00c2d6" />
        <Polygon points="160,130 154,144 166,144" fill="#1769e0" />
        {[
          [137, 110, "1"],
          [216, 69, "2"],
          [241, 111, "3"],
        ].map(([x, y, t]) => (
          <SvgText
            key={t}
            x={x}
            y={y}
            fontSize={9}
            fill="white"
            textAnchor="middle"
          >
            {t}
          </SvgText>
        ))}
      </Svg>
      <Label muted size={10}>
        0–1.5 m Danger · 1.5–3.0 m Caution · 3.0 m+ Safe
      </Label>
    </SectionCard>
  );
}
