"use client";

import { useMemo, useState } from "react";
import auditLog from "../../../data/audit.json";
import { DataTable } from "../../../components/DataTable";
import { StatusBadge } from "../../../components/StatusBadge";
import { formatDate } from "../../../lib/format";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  context: string;
  ip: string;
  critical: boolean;
}

export default function AuditPage() {
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [actorFilter, setActorFilter] = useState("Todos");

  const actors = useMemo(() => Array.from(new Set((auditLog as AuditEntry[]).map((entry) => entry.actor))), []);

  const filteredEntries = useMemo(() => {
    return (auditLog as AuditEntry[]).filter((entry) => {
      const matchesCritical = !showOnlyCritical || entry.critical;
      const matchesActor = actorFilter === "Todos" || entry.actor === actorFilter;
      return matchesCritical && matchesActor;
    });
  }, [showOnlyCritical, actorFilter]);

  const groupedByIp = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    for (const entry of auditLog as AuditEntry[]) {
      if (!map.has(entry.ip)) {
        map.set(entry.ip, []);
      }
      map.get(entry.ip)!.push(entry);
    }
    return Array.from(map.entries())
      .map(([ip, entries]) => ({ ip, count: entries.length, criticalCount: entries.filter((e) => e.critical).length }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="grid" style={{ gap: "2rem" }}>
      <header>
        <h1 className="sectionTitle">Auditoría</h1>
        <p className="sectionDescription">
          Rastrea accesos concurrentes, identifica acciones críticas y detecta comportamientos sospechosos en tiempo real.
        </p>
      </header>

      <section className="tableCard" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={showOnlyCritical}
              onChange={(event) => setShowOnlyCritical(event.target.checked)}
            />
            Sólo eventos críticos
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label htmlFor="actor">Actor</label>
            <select id="actor" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)}>
              <option value="Todos">Todos</option>
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {groupedByIp.map((group) => (
            <div
              key={group.ip}
              style={{
                background: "#f8fafc",
                borderRadius: "0.85rem",
                padding: "0.85rem 1rem",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{group.ip}</div>
              <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                {group.count} evento{group.count === 1 ? "" : "s"} / {group.criticalCount} crítico{group.criticalCount === 1 ? "" : "s"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <DataTable
          data={filteredEntries}
          emptyMessage="No hay eventos que coincidan con los filtros seleccionados"
          columns={[
            { header: "ID", accessor: "id" },
            {
              header: "Fecha y hora",
              accessor: (entry) => formatDate(entry.timestamp),
            },
            { header: "Actor", accessor: "actor" },
            { header: "Acción", accessor: "action" },
            { header: "Contexto", accessor: "context" },
            { header: "IP", accessor: "ip" },
            {
              header: "Criticidad",
              accessor: (entry) => (
                <StatusBadge
                  label={entry.critical ? "Crítico" : "Monitoreado"}
                  variant={entry.critical ? "danger" : "info"}
                />
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
