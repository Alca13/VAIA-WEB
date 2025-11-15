"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import styles from "./layout.module.css";

const navItems = [
  { href: "/dashboard/users", label: "Usuarios" },
  { href: "/dashboard/reports", label: "Reportes" },
  { href: "/dashboard/audit", label: "Auditoría" },
  { href: "/dashboard/branding", label: "Identidad visual" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>VAIA</span>
          <span>Admin</span>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
