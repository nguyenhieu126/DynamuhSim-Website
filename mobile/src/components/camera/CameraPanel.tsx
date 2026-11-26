import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Polygon,
  Circle,
} from "react-native-svg";
import { tracks } from "../../data/demo";
import { Badge, Label, Row, SectionCard, Segments } from "../common/UI";
export function DepthPreview() {
  return (
    <Svg
      viewBox="0 0 180 190"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1c195c" />
          <Stop offset="1" stopColor="#00c2d6" />
        </LinearGradient>
      </Defs>
      <Rect width={180} height={190} fill="#080f20" />
      <Polygon points="0,0 64,70 64,128 0,190" fill="#1b2d66" />
      <Polygon points="180,0 120,70 120,128 180,190" fill="#152458" />
      <Polygon points="0,190 64,128 120,128 180,190" fill="url(#depth)" />
      <Circle cx={92} cy={79} r={7} fill="#21b9ed" />
      <Rect x={86} y={90} width={12} height={43} rx={4} fill="#21b9ed" />
    </Svg>
  );
}
export function CameraPanel({
  detection = false,
  initialMode = "RGB-D",
  onTrack,
}: {
  detection?: boolean;
  initialMode?: string;
  onTrack?: (id: number) => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [expanded, setExpanded] = useState(false);
  const asset = detection
    ? require("../../../assets/camera-lab.png")
    : require("../../../assets/camera-corridor.png");
  return (
    <SectionCard
      title={detection ? "RGB Stream · Detection" : "Live Camera"}
      icon="videocam-outline"
      aside={<Badge>DEMO image</Badge>}
    >
      <Row style={{ marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Segments
            label="Camera mode"
            options={["RGB", "DEPTH", "RGB-D"]}
            value={mode}
            onChange={setMode}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Expand camera preview"
          onPress={() => setExpanded(!expanded)}
          style={{
            minWidth: 48,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Label size={20}>⛶</Label>
        </Pressable>
      </Row>
      <View
        style={{
          height: expanded ? 340 : 220,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#060e20",
          flexDirection: "row",
        }}
      >
        {mode !== "DEPTH" && (
          <View style={{ flex: 1, overflow: "hidden" }}>
            <Image
              source={asset}
              resizeMode="cover"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel="Local reference image, not a live camera"
            />
            {(detection ? tracks : [tracks[0]]).map((track) => (
              <Pressable
                key={track.id}
                accessibilityRole="button"
                accessibilityLabel={`Select track ${track.id}`}
                onPress={() => onTrack?.(track.id)}
                style={{
                  position: "absolute",
                  left: `${track.box[0] * 100}%`,
                  top: `${track.box[1] * 100}%`,
                  width: `${track.box[2] * 100}%`,
                  height: `${track.box[3] * 100}%`,
                  borderWidth: 1.5,
                  borderColor: track.risk === "High" ? "#ff5454" : "#00e2cd",
                  minWidth: 35,
                  minHeight: 48,
                }}
              >
                <Label
                  size={9}
                  color="#ffffff"
                  style={{
                    backgroundColor:
                      track.risk === "High" ? "#a51c36" : "#006d6b",
                  }}
                >
                  {`#${track.id} ${track.label.split(" ")[0]} ${track.confidence.toFixed(2)}`}
                </Label>
              </Pressable>
            ))}
          </View>
        )}
        {mode !== "RGB" && (
          <View style={{ flex: 1 }}>
            <DepthPreview />
            <Label
              mono
              size={9}
              color="#ffffff"
              style={{ position: "absolute", right: 5, top: 5 }}
            >
              5.0 m
            </Label>
            <Label
              mono
              size={9}
              color="#ffffff"
              style={{ position: "absolute", right: 5, bottom: 22 }}
            >
              0.0 m
            </Label>
          </View>
        )}
        <View
          style={{
            position: "absolute",
            left: 4,
            bottom: 4,
            right: 4,
            backgroundColor: "#060e20dc",
            padding: 3,
          }}
        >
          <Label mono size={9} color="#e2e8f0">
            REFERENCE IMAGE · NOT A LIVE STREAM
          </Label>
        </View>
      </View>
      <Label size={10} muted style={{ marginTop: 6 }}>
        DEMO RGB / illustrative depth · No camera connected
      </Label>
    </SectionCard>
  );
}
