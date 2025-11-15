import React, { useEffect, useMemo, useState } from 'react';
import { useAdminApi } from './hooks/use-admin-api';
import { RecoveryRequestForm } from './components/recovery-request-form';
import { DeviceList } from './components/device-list';
import { UserTable } from './components/user-table';
import { DeviceAuthorizationPanel } from './components/device-authorization-panel';

interface UiUser {
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

interface UiDevice {
  id: string;
  userId: string;
  fingerprint: string;
  isAuthorized: boolean;
  token: string;
  createdAt: string;
  lastUsedAt: string;
}

export const App: React.FC = () => {
  const { fetchUsers, fetchDevices, blockUser, authorizeDevice, revokeDevice, forceReset } = useAdminApi();
  const [users, setUsers] = useState<UiUser[]>([]);
  const [devices, setDevices] = useState<UiDevice[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useMemo(
    () => async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError('No se pudo cargar la lista de usuarios.');
      } finally {
        setLoadingUsers(false);
      }
    },
    [fetchUsers],
  );

  const refreshDevices = useMemo(
    () => async () => {
      setLoadingDevices(true);
      setError(null);
      try {
        const data = await fetchDevices();
        setDevices(data);
      } catch (err) {
        setError('No se pudo obtener el listado de dispositivos.');
      } finally {
        setLoadingDevices(false);
      }
    },
    [fetchDevices],
  );

  useEffect(() => {
    refreshUsers();
    refreshDevices();
  }, [refreshUsers, refreshDevices]);

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Panel de Administración</h1>
          <p style={{ marginTop: '-0.5rem', color: '#94a3b8' }}>
            Supervisa usuarios, gestiona dispositivos de acceso y restablece credenciales de manera centralizada.
          </p>
        </div>
        <button onClick={() => { refreshUsers(); refreshDevices(); }}>Actualizar</button>
      </header>

      {error && (
        <section>
          <h2>Algo salió mal</h2>
          <p>{error}</p>
        </section>
      )}

      <div className="grid grid-cols-2">
        <section>
          <h2>Usuarios</h2>
          <p>Activa o bloquea cuentas, restablece contraseñas y administra la configuración 2FA.</p>
          <UserTable
            users={users}
            loading={loadingUsers}
            onBlock={(userId, blocked) => blockUser(userId, blocked).then(refreshUsers)}
            onForceReset={(userId) => forceReset(userId).then(refreshUsers)}
          />
        </section>

        <section>
          <h2>Recuperación</h2>
          <p>Envía enlaces de recuperación manualmente por correo electrónico o SMS.</p>
          <RecoveryRequestForm onCompleted={refreshUsers} />
        </section>
      </div>

      <section>
        <h2>Dispositivos registrados</h2>
        <p>Aprueba o revoca dispositivos según las políticas específicas para cada rol.</p>
        <DeviceAuthorizationPanel
          devices={devices}
          loading={loadingDevices}
          onAuthorize={(deviceId) => authorizeDevice(deviceId).then(refreshDevices)}
          onRevoke={(deviceId) => revokeDevice(deviceId).then(refreshDevices)}
        />
        <DeviceList devices={devices} />
      </section>
    </main>
  );
};
