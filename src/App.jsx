import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';

Modal.setAppElement('#root');

const API_URL = 'https://gestor-de-novedades-backend.onrender.com/actividades';

function App() {
  const [actividades, setActividades] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    lugar: '',
    horario: '',
    fechaFin: '',
    detalles: ''
  });

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    lugar: '',
    horario: '',
    fechaFin: '',
    detalles: '',
  });

  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarActividades = async () => {
    const res = await axios.get(API_URL);
    setActividades(res.data);
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  // Validaciones
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const soloNumerosEspeciales = /^[0-9: -]+$/;

  // Agregar actividad
  const agregarActividad = async () => {
    try {
      if (!form.nombre.match(soloLetras)) {
        alert('El campo "Novedad" solo acepta letras.');
        return;
      }
      if (!form.lugar.match(soloLetras)) {
        alert('El campo "Lugar" solo acepta letras.');
        return;
      }
      if (!form.horario.match(soloNumerosEspeciales)) {
        alert('El campo "Horario" solo acepta números y caracteres especiales (: -).');
        return;
      }
      if (!form.fechaFin) {
        alert('Completa la fecha de finalización.');
        return;
      }
      if (!form.detalles.trim()) {
        alert('El campo "Detalles" no puede estar vacío.');
        return;
      }

      setLoading(true);
      await axios.post(API_URL, form);
      setForm({ nombre: '', lugar: '', horario: '', fechaFin: '', detalles: '' });
      await cargarActividades();
    } catch (error) {
      alert('Error al agregar Novedad');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar actividad
  const eliminarActividad = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarActividades();
    } catch (error) {
      alert('Error al eliminar Novedad');
    }
  };

  // Iniciar edición
  const iniciarEdicion = (act) => {
    setEditId(act._id);
    setEditForm({
      nombre: act.nombre,
      lugar: act.lugar,
      horario: act.horario,
      fechaFin: act.fechaFin ? act.fechaFin.slice(0,10) : '',
      detalles: act.detalles || ''
    });
  };

  // Guardar edición
  const guardarEdicion = async (id) => {
    try {
      if (!editForm.nombre.match(soloLetras)) {
        alert('El campo "Novedad" solo acepta letras.');
        return;
      }
      if (!editForm.lugar.match(soloLetras)) {
        alert('El campo "Lugar" solo acepta letras.');
        return;
      }
      if (!editForm.horario.match(soloNumerosEspeciales)) {
        alert('El campo "Horario" solo acepta números y caracteres especiales (: -).');
        return;
      }
      if (!editForm.fechaFin) {
        alert('Completa la fecha de finalización.');
        return;
      }

      await axios.put(`${API_URL}/${id}`, editForm);
      setEditId(null);
      cargarActividades();
    } catch (error) {
      alert('Error al editar Novedad');
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditId(null);
  };

  // Cambios en el formulario
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Cambios en el filtro de búsqueda
  const handleBusqueda = e => {
    setBusqueda(e.target.value);
  };

  // Mostrar tachado si la fecha y hora de finalización ya pasaron
  const estaFinalizada = act => {
    if (!act.fechaFin || !act.horario) return false;
    const fecha = act.fechaFin.slice(0,10);
    const fechaHoraStr = `${fecha}T${act.horario}`;
    const fechaHora = new Date(fechaHoraStr);
    return new Date() > fechaHora;
  };

  // Filtrar actividades por búsqueda
  const actividadesFiltradas = actividades.filter(act => {
    const texto = `${act.nombre} ${act.lugar} ${act.detalles}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // Ordenar actividades por fecha y hora (próximas primero)
  const actividadesOrdenadas = [...actividadesFiltradas].sort((a, b) => {
    const fechaA = new Date(`${a.fechaFin.slice(0,10)}T${a.horario}`);
    const fechaB = new Date(`${b.fechaFin.slice(0,10)}T${b.horario}`);
    return fechaA - fechaB;
  });

  // Cantidad de actividades
  const totalActividades = actividadesOrdenadas.length;
  const totalFinalizadas = actividadesOrdenadas.filter(estaFinalizada).length;

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: 'linear-gradient(135deg, #000000ff 0%, #3f3a3aff 100%)',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0
      }}
    >
      <header className="mb-4 text-center">
        <h1 className="mt-2" style={{ color: '#ffffffff', fontWeight: 'bold', fontSize: '3.2rem', textDecoration: 'underline'}}>Gestor de novedades</h1>
      </header>

      <div className="card mb-4 shadow-sm" style={{ width: '100%', fontSize: '1.3rem', maxWidth: '600px', margin: 'auto' }}>
        <div className="card-body" style={{ backgroundColor: '#000000ff' }}>
          <h2 className="card-title mb-3" style={{ color: '#000000ff', fontSize: '2.2rem' }}>Agregar Novedad</h2>
          <form onSubmit={e => { e.preventDefault(); agregarActividad(); }}>
            <div className="row g-2" style={{ flexDirection: 'column' }}>
              <div className="col-12">
                <label htmlFor="nombre" className="form-label" style={{ color: "#fff" }}>Novedad</label>
                <input id="nombre" name="nombre" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Novedad" value={form.nombre} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label htmlFor="lugar" className="form-label" style={{ color: "#fff" }}>Ubicación</label>
                <input id="lugar" name="lugar" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Ubicación" value={form.lugar} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label htmlFor="horario" className="form-label" style={{ color: "#fff" }}>Horario</label>
                <input id="horario" name="horario" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Horario" value={form.horario} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label htmlFor="fechaFin" className="form-label" style={{ color: "#fff" }}>Fecha</label>
                <input id="fechaFin" name="fechaFin" type="date" className="form-control form-control-lg" style={{ width: '100%' }} value={form.fechaFin} onChange={handleChange} />
              </div>
              <div className="col-12 mt-2">
                <label htmlFor="detalles" className="form-label" style={{ color: "#fff" }}>Detalles</label>
                <input
                  id="detalles"
                  name="detalles"
                  className="form-control form-control-lg"
                  style={{ width: '100%' }}
                  placeholder="Detalles"
                  value={form.detalles}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn mt-3 w-100"
              style={{ fontSize: '1.3rem', padding: '16px 0', color:'#ffffffff' , backgroundColor: '#242323ff' }}
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {" "}Agregando...
                </span>
              ) : "Agregar"}
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm" style={{ width: '100%', fontSize: '1.3rem', maxWidth: '600px', margin: 'auto' }}>
        <div className="card-body" style={{ backgroundColor: '#030303ff' }}>
          <h3 className="card-title mb-3" style={{ color: '#ffffffff', fontSize: '2.2rem' }}>Novedades</h3>
          {/* Campo de búsqueda */}
          <label htmlFor="busqueda" className="form-label" style={{ color: "#fff" }}>Buscar</label>
          <input
            id="busqueda"
            type="text"
            className="form-control mb-3"
            placeholder="Buscar por nombre, lugar o detalles..."
            value={busqueda}
            onChange={handleBusqueda}
          />
          {/* Cantidad de actividades */}
          <div className="mb-3" style={{ color: "#fff" }}>
            Total: <strong>{totalActividades}</strong> | Finalizadas: <strong>{totalFinalizadas}</strong>
          </div>
          <ul className="list-group">
            {actividadesOrdenadas.map(act => (
              <li
                key={act._id}
                className="list-group-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-2"
                style={{
                  textDecoration: estaFinalizada(act) ? 'line-through' : 'none',
                  background: estaFinalizada(act) ? '#f8bbd0' : '#fff',
                  fontSize: '1.3rem',
                  padding: '22px 12px',
                }}
              >
                <span>
                  <strong style={{ color: '#000000ff', fontSize: '1.4rem' }}>{act.nombre}</strong> - <span style={{ color: '#000000ff' }}>{act.lugar}</span> - <span style={{ color: '#000000ff' }}>{act.horario}</span> - <span>{act.fechaFin?.slice(0,10)}</span> - <span style={{ color: '#888' }}>{act.detalles}</span>
                </span>
                <span>
                  <button onClick={() => eliminarActividad(act._id)} className="btn btn-outline-danger btn-lg mx-1" style={{ fontSize: '1.1rem'}}>Eliminar</button>
                  <button onClick={() => iniciarEdicion(act)} className="btn btn-outline-primary btn-lg mx-1" style={{ fontSize: '1.1rem' }}>Modificar</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={!!editId}
        onRequestClose={cancelarEdicion}
        contentLabel="Editar Actividad"
        style={{
          content: {
            maxWidth: '500px',
            margin: 'auto',
            padding: '2.5rem',
            borderRadius: '1rem',
            boxShadow: '0 0 20px #ffffffff'
          }
        }}
      >
        <h2 className="mb-3" style={{ color: '#000000ff', fontSize: '2.2rem' }}>Editar novedad</h2>
        <form onSubmit={e => { e.preventDefault(); guardarEdicion(editId); }}>
          <label htmlFor="edit-nombre" className="form-label">Nombre</label>
          <input id="edit-nombre" name="nombre" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" />
          <label htmlFor="edit-lugar" className="form-label">Lugar</label>
          <input id="edit-lugar" name="lugar" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.lugar} onChange={handleEditChange} placeholder="Lugar" />
          <label htmlFor="edit-horario" className="form-label">Horario</label>
          <input id="edit-horario" name="horario" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.horario} onChange={handleEditChange} placeholder="Horario" />
          <label htmlFor="edit-fechaFin" className="form-label">Fecha</label>
          <input id="edit-fechaFin" name="fechaFin" type="date" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.fechaFin} onChange={handleEditChange} placeholder="Fecha" />
          <label htmlFor="edit-detalles" className="form-label">Detalles</label>
          <input id="edit-detalles" name="detalles" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.detalles} onChange={handleEditChange} placeholder="Detalles" />
          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-success btn-lg mx-2" style={{ fontSize: '1.2rem' }}>Guardar</button>
            <button type="button" onClick={cancelarEdicion} className="btn btn-secondary btn-lg" style={{ fontSize: '1.2rem' }}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;