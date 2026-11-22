import {
  AlertTriangle,
  Inbox,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return (
    <button
      type="button"
      className={`button ${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Card({
  title,
  icon: Icon,
  action,
  children,
  className = "",
  id,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`card ${className}`}>
      <div className="card-header">
        <h2>
          {Icon && <Icon size={19} />} {title}
        </h2>
        {action && <div className="card-action">{action}</div>}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
export function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <div className="card metric">
      <div className="metric-label">
        <span className="icon-tile">
          <Icon size={20} />
        </span>
        {label}
      </div>
      <div className={`metric-value ${tone || ""}`}>{value}</div>
      <div className="muted small">{detail || "N/A"}</div>
    </div>
  );
}
export function Empty({
  title = "No data available",
  detail = "Waiting for a verified backend data source.",
  loading = false,
}: {
  title?: string;
  detail?: string;
  loading?: boolean;
}) {
  const Icon = loading ? LoaderCircle : Inbox;
  return (
    <div className="empty">
      <Icon size={30} className={loading ? "spin" : ""} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
export function Notice({
  children,
  critical = false,
}: {
  children: ReactNode;
  critical?: boolean;
}) {
  return (
    <div
      role={critical ? "alert" : "status"}
      className={`notice ${critical ? "critical" : ""}`}
    >
      <AlertTriangle size={18} />
      <span>{children}</span>
    </div>
  );
}
export function DataTable({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
}) {
  return (
    <div className="table-scroll">
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty title="No records" />}
    </div>
  );
}
export const num = (n: number | null | undefined, decimals = 2, unit = "") =>
  n == null ? "N/A" : `${n.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
