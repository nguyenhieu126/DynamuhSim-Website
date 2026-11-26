import React, { useState } from "react";
import { View } from "react-native";
import { events } from "../../data/demo";
import { useTheme } from "../../contexts/ThemeContext";
import { Badge, Label, Row, SectionCard, Segments } from "../common/UI";
export function EventTimeline({
  filterable = false,
}: {
  filterable?: boolean;
}) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState("All");
  return (
    <SectionCard
      title={filterable ? "AI Events Timeline" : "Recent Alerts & Events"}
      icon="notifications-outline"
      aside={<Badge>DEMO events</Badge>}
    >
      {filterable && (
        <Segments
          options={["All", "Warnings", "Critical"]}
          value={filter}
          onChange={setFilter}
        />
      )}
      {events
        .filter(
          (e) =>
            filter === "All" ||
            e.level === (filter === "Critical" ? "critical" : "warning"),
        )
        .map((e) => (
          <View
            key={e.id}
            style={{
              borderLeftWidth: 3,
              borderColor:
                colors[
                  e.level === "critical"
                    ? "red"
                    : e.level === "warning"
                      ? "amber"
                      : "cyan"
                ],
              paddingLeft: 10,
              paddingVertical: 9,
              marginTop: 8,
            }}
          >
            <Row
              style={{
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Label bold size={12} style={{ flex: 1 }}>
                {e.title}
              </Label>
              <Label mono muted size={10}>
                {e.time}
              </Label>
            </Row>
            <Label size={11} muted>
              {e.detail}
            </Label>
          </View>
        ))}
    </SectionCard>
  );
}
