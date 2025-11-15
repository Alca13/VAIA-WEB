import React from 'react';

interface Device {
  id: string;
  userId: string;
  fingerprint: string;
  isAuthorized: boolean;
  createdAt: string;
  lastUsedAt: string;
}

interface Props {
  devices: Device[];
  loading: boolean;
  onAuthorize: (deviceId: string) => Promise<unknown>;
  onRevoke: (deviceId: string) => Promise<unknown>;
}

export const DeviceAuthorizationPanel: React.FC<Props> = ({ devices, loading, onAuthorize, onRevoke }) => {
  if (loading) {
    return <p>Consultando dispositivos...</p>;
  }

  const pending = devices.filter((device) => !device.isAuthorized);

  if (pending.length === 0) {
    return <p>Todos los dispositivos están autorizados.</p>;
  }

  return (
    <div className="grid" style={{ marginBottom: '1.5rem' }}>
      {pending.map((device) => (
        <article key={device.id} style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px', padding: '1rem' }}>
          <h3>Dispositivo pendiente</h3>
          <p>
            <strong>Usuario:</strong> {device.userId}
          </p>
          <p>
            <strong>Fingerprint:</strong> {device.fingerprint}
          </p>
          <p>
            <strong>Registrado:</strong> {new Date(device.createdAt).toLocaleString()}
          </p>
          <div className="card-actions">
            <button onClick={() => onAuthorize(device.id)}>Autorizar</button>
            <button onClick={() => onRevoke(device.id)}>Revocar</button>
          </div>
        </article>
      ))}
    </div>
  );
};
