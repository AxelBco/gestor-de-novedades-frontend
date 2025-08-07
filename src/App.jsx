import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

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

      await axios.post(API_URL, form);
      setForm({ nombre: '', lugar: '', horario: '', fechaFin: '', detalles: '' });
      cargarActividades();
    } catch (error) {
      alert('Error al agregar Novedad');
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

  // Mostrar tachado si la fecha y hora de finalización ya pasaron
  const estaFinalizada = act => {
    if (!act.fechaFin || !act.horario) return false;
    // Unir fecha y hora en formato ISO
    const fecha = act.fechaFin.slice(0,10);
    // Si horario es "16:00", unirlo a la fecha
    const fechaHoraStr = `${fecha}T${act.horario}`;
    const fechaHora = new Date(fechaHoraStr);
    return new Date() > fechaHora;
  };

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
          <div className="row g-2" style={{ flexDirection: 'column' }}>
            <div className="col-12">
              <input name="nombre" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Novedad" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="col-12">
              <input name="lugar" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Ubicacion" value={form.lugar} onChange={handleChange} />
            </div>
            <div className="col-12">
              <input name="horario" className="form-control form-control-lg" style={{ width: '100%' }} placeholder="Horario" value={form.horario} onChange={handleChange} />
            </div>
            <div className="col-12">
              <input name="fechaFin" type="date" className="form-control form-control-lg" style={{ width: '100%' }} value={form.fechaFin} onChange={handleChange} />
            </div>
            <div className="col-12 mt-2">
              <input
                name="detalles"
                className="form-control form-control-lg"
                style={{ width: '100%' }}
                placeholder="Detalles"
                value={form.detalles}
                onChange={handleChange}
              />
            </div>
          </div>
          <button onClick={agregarActividad} className="btn mt-3 w-100" style={{ fontSize: '1.3rem', padding: '16px 0', color:'#ffffffff' , backgroundColor: '#242323ff' }}>Agregar</button>
        </div>
      </div>

      <div className="card shadow-sm" style={{ width: '100%', fontSize: '1.3rem', maxWidth: '600px', margin: 'auto' }}>
        <div className="card-body" style={{ backgroundColor: '#030303ff' }}>
          <h3 className="card-title mb-3" style={{ color: '#ffffffff', fontSize: '2.2rem' }}>Novedades</h3>
          <ul className="list-group">
            {actividades.map(act => (
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
        <input name="nombre" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" />
        <input name="lugar" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.lugar} onChange={handleEditChange} placeholder="Lugar" />
        <input name="horario" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.horario} onChange={handleEditChange} placeholder="Horario" />
        <input name="fechaFin" type="date" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.fechaFin} onChange={handleEditChange} placeholder="Fecha" />
        <input name="detalles" className="form-control form-control-lg mb-3" style={{ width: '100%' }} value={editForm.detalles} onChange={handleEditChange} placeholder="Detalles" />
        <div className="d-flex justify-content-end mt-3">
          <button onClick={() => guardarEdicion(editId)} className="btn btn-success btn-lg mx-2" style={{ fontSize: '1.2rem' }}>Guardar</button>
          <button onClick={cancelarEdicion} className="btn btn-secondary btn-lg" style={{ fontSize: '1.2rem' }}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;