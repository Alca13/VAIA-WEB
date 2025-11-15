import React from 'react';

interface Device {
  id: string;
  userId: string;
  fingerprint: string;
  token: string;
  isAuthorized: boolean;
  createdAt: string;
  lastUsedAt: string;
}

interface Props {
  devices: Device[];
}

export const DeviceList: React.FC<Props> = ({ devices }) => {
  if (devices.length === 0) {
    return <p>No hay dispositivos registrados todavía.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Fingerprint</th>
            <th>Usuario</th>
            <th>Estado</th>
            <th>Último acceso</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>{device.fingerprint}</td>
              <td>{device.userId}</td>
              <td>
                <span className="badge" data-type={device.isAuthorized ? undefined : 'blocked'}>
                  {device.isAuthorized ? 'Autorizado' : 'Pendiente'}
                </span>
              </td>
              <td>{new Date(device.lastUsedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
