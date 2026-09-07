import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { obtenerPerfil } from '../api/apiService'
import { formatearFecha } from '../utils'

export default function Perfil() {
  const { instance } = useMsal();
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerPerfil(instance).then(setPerfil).catch((e) => setError(e.message));
  }, [instance]);

  if (error) return <p className="aviso aviso-error">{error}</p>;
  if (!perfil) return <p className="aviso">Cargando perfil...</p>;

  return (
    <section>
      <h1>Perfil</h1>
      <p className="descripcion">
        Estos datos los guardo ms-usuarios en la base la primera vez que entraste,
        leyendolos de los claims de tu token.
      </p>
      <dl className="ficha">
        <div><dt>Nombre</dt><dd>{perfil.nombre}</dd></div>
        <div><dt>Correo</dt><dd>{perfil.correo}</dd></div>
        <div><dt>Rol</dt><dd>{perfil.rol}</dd></div>
        <div><dt>Registrado</dt><dd>{formatearFecha(perfil.fechaRegistro)}</dd></div>
      </dl>
    </section>
  )
}
