import users from "../../../data/users.json";
import { DataTable } from "../../../components/DataTable";
import { StatusBadge } from "../../../components/StatusBadge";
import { formatDate } from "../../../lib/format";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Activo" | "Suspendido" | string;
  lastAccess: string;
  departments: string[];
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info"> = {
  Activo: "success",
  Suspendido: "danger",
};

export const metadata = {
  title: "Usuarios | VAIA Admin",
};

export default function UsersPage() {
  const rows = users as User[];
  return (
    <div className="grid" style={{ gap: "2rem" }}>
      <header>
        <h1 className="sectionTitle">Usuarios</h1>
        <p className="sectionDescription">
          Administra perfiles, accesos y departamentos asociados a cada colaborador de la organización.
        </p>
      </header>
      <section>
        <DataTable
          data={rows}
          columns={[
            { header: "ID", accessor: "id" },
            { header: "Nombre", accessor: "name" },
            { header: "Correo", accessor: "email" },
            { header: "Rol", accessor: "role" },
            {
              header: "Estado",
              accessor: (user) => (
                <StatusBadge
                  label={user.status}
                  variant={statusVariantMap[user.status] ?? "info"}
                />
              ),
            },
            {
              header: "Último acceso",
              accessor: (user) => formatDate(user.lastAccess),
            },
            {
              header: "Departamentos",
              accessor: (user) => user.departments.join(", "),
            },
          ]}
        />
      </section>
    </div>
  );
}
