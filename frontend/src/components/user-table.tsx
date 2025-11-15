import React from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  recovery: {
    email?: string;
    phone?: string;
  };
}

interface Props {
  users: User[];
  loading: boolean;
  onBlock: (userId: string, blocked: boolean) => Promise<unknown>;
  onForceReset: (userId: string) => Promise<unknown>;
}

export const UserTable: React.FC<Props> = ({ users, loading, onBlock, onForceReset }) => {
  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Correo</th>
            <th>Rol</th>
            <th>2FA</th>
            <th>Estado</th>
            <th>Recuperación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <span className="badge">{user.role}</span>
              </td>
              <td>{user.twoFactorEnabled ? 'Activado' : 'Desactivado'}</td>
              <td>
                <span className="badge" data-type={user.isBlocked ? 'blocked' : undefined}>
                  {user.isBlocked ? 'Bloqueado' : 'Activo'}
                </span>
              </td>
              <td>
                {user.recovery.email && <div>📧 {user.recovery.email}</div>}
                {user.recovery.phone && <div>📱 {user.recovery.phone}</div>}
              </td>
              <td>
                <div className="card-actions">
                  <button onClick={() => onBlock(user.id, !user.isBlocked)}>
                    {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button onClick={() => onForceReset(user.id)}>Forzar reset</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
