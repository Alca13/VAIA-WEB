"use client";

import { useMemo, useState } from "react";
import reports from "../../../data/reports.json";
import { DataTable } from "../../../components/DataTable";
import { StatusBadge } from "../../../components/StatusBadge";
import { formatDate } from "../../../lib/format";
import { downloadFile } from "../../../lib/api";

interface Report {
  id: string;
  title: string;
  department: string;
  owner: string;
  submittedAt: string;
  status: string;
  riskLevel: "Alto" | "Medio" | "Bajo" | string;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info"> = {
  Aprobado: "success",
  "En revisión": "info",
  Observado: "warning",
  Pendiente: "info",
};

const riskVariantMap: Record<string, "success" | "warning" | "danger" | "info"> = {
  Bajo: "success",
  Medio: "warning",
  Alto: "danger",
};

export default function ReportsPage() {
  const [departmentFilter, setDepartmentFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set((reports as Report[]).map((report) => report.department)));
  }, []);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set((reports as Report[]).map((report) => report.status)));
  }, []);

  const filteredReports = useMemo(() => {
    return (reports as Report[]).filter((report) => {
      const matchesDepartment =
        departmentFilter === "Todos" || report.department === departmentFilter;
      const matchesStatus = statusFilter === "Todos" || report.status === statusFilter;
      const matchesSearch =
        search.trim().length === 0 ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.owner.toLowerCase().includes(search.toLowerCase()) ||
        report.id.toLowerCase().includes(search.toLowerCase());

      return matchesDepartment && matchesStatus && matchesSearch;
    });
  }, [departmentFilter, statusFilter, search]);

  const handleDecisionChange = (reportId: string, value: string) => {
    setDecisions((prev) => ({ ...prev, [reportId]: value }));
  };

  const exportToCsv = () => {
    const headers = ["ID", "Título", "Departamento", "Responsable", "Estado", "Riesgo", "Fecha", "Decisión"];
    const rows = filteredReports.map((report) => [
      report.id,
      report.title,
      report.department,
      report.owner,
      report.status,
      report.riskLevel,
      formatDate(report.submittedAt),
      decisions[report.id] ?? "Sin decisión",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    downloadFile(`reportes-${new Date().toISOString()}.csv`, csvContent, "text/csv;charset=utf-8");
  };

  return (
    <div className="grid" style={{ gap: "2rem" }}>
      <header>
        <h1 className="sectionTitle">Reportes</h1>
        <p className="sectionDescription">
          Revisa, filtra y aprueba los entregables estratégicos por departamento con trazabilidad de decisiones.
        </p>
      </header>

      <section className="tableCard" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label htmlFor="department-filter">Departamento</label>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="Todos">Todos</option>
              {uniqueDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="Todos">Todos</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "220px", gap: "0.25rem" }}>
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              type="search"
              placeholder="ID, título o responsable"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ padding: "0.55rem 0.75rem", borderRadius: "0.65rem", border: "1px solid #cbd5f5" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#475569", fontSize: "0.9rem" }}>
            {filteredReports.length} reporte{filteredReports.length === 1 ? "" : "s"} encontrados
          </span>
          <button className="actionButton" onClick={exportToCsv}>
            Exportar CSV
          </button>
        </div>
      </section>

      <section>
        <DataTable
          data={filteredReports}
          emptyMessage="No hay reportes que coincidan con los filtros seleccionados"
          columns={[
            { header: "ID", accessor: "id" },
            { header: "Título", accessor: "title" },
            { header: "Departamento", accessor: "department" },
            { header: "Responsable", accessor: "owner" },
            {
              header: "Estado",
              accessor: (report) => (
                <StatusBadge
                  label={report.status}
                  variant={statusVariantMap[report.status] ?? "info"}
                />
              ),
            },
            {
              header: "Nivel de riesgo",
              accessor: (report) => (
                <StatusBadge
                  label={report.riskLevel}
                  variant={riskVariantMap[report.riskLevel] ?? "info"}
                />
              ),
            },
            {
              header: "Enviado",
              accessor: (report) => formatDate(report.submittedAt),
            },
            {
              header: "Decisión",
              accessor: (report) => (
                <select
                  value={decisions[report.id] ?? ""}
                  onChange={(event) => handleDecisionChange(report.id, event.target.value)}
                  style={{
                    padding: "0.35rem 0.65rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5f5",
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="Aprobado">Aprobar</option>
                  <option value="Rechazado">Rechazar</option>
                  <option value="Devolver">Solicitar ajustes</option>
                </select>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
