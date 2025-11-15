import styles from "./StatusBadge.module.css";

type Variant = "success" | "warning" | "danger" | "info";

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
}

export function StatusBadge({ label, variant = "info" }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>;
}
