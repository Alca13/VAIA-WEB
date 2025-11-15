import React, { useState } from 'react';
import { useAdminApi } from '../hooks/use-admin-api';

interface Props {
  onCompleted?: () => void;
}

export const RecoveryRequestForm: React.FC<Props> = ({ onCompleted }) => {
  const { sendRecovery } = useAdminApi();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await sendRecovery(email);
      if (response.success) {
        setStatus(`Solicitud enviada a ${response.deliveredTo ?? email}`);
        onCompleted?.();
      } else {
        setStatus(response.message ?? 'No fue posible generar el token de recuperación.');
      }
    } catch (err) {
      setStatus('No se pudo enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Correo electrónico del usuario
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Procesando…' : 'Enviar enlace de recuperación'}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
};
