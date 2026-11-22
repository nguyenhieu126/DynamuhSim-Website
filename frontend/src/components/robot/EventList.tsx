import { AlertTriangle, Bell, Info } from "lucide-react";
import { useRobot } from "../../contexts/RobotContext";
import { Badge, Card, Empty } from "../common/UI";
export function EventList({
  title = "Recent Alerts & Events",
  filter = "all",
}: {
  title?: string;
  filter?: string;
}) {
  const { snapshot, mode } = useRobot();
  const events = (snapshot?.events || []).filter(
    (e) => filter === "all" || e.level === filter,
  );
  return (
    <Card
      title={title}
      icon={Bell}
      action={
        <Badge tone={mode === "demo" ? "purple" : "neutral"}>
          {mode === "demo" ? "DEMO events" : "Backend events"}
        </Badge>
      }
    >
      <div className="event-list">
        {events.map((e) => (
          <div className="event" key={e.id}>
            <span className={`event-icon ${e.level}`}>
              {e.level === "info" ? (
                <Info size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
            </span>
            <div>
              <div className="event-top">
                <strong>{e.title}</strong>
                <time className="mono">{e.time}</time>
              </div>
              <p>{e.detail}</p>
            </div>
          </div>
        ))}
        {!events.length && <Empty title="No events" />}
      </div>
    </Card>
  );
}
