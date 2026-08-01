import { useState, useEffect } from 'react'
import './styles/variables.css'
import './styles/globals.css'
import './styles/components.css'

interface Project {
  id: string
  name: string
  responsable: string
  estado: string
  prioridad?: string
  fecha_limite?: string
  siguiente_paso?: string
  bloqueos?: string
  notas?: string
  tipo_proyecto?: string
  version: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterResponsable, setFilterResponsable] = useState<string>('')

  // Formulario de creación
  const [formData, setFormData] = useState({
    name: '',
    bac: 50000,
    responsable: '',
    estado: 'Activo',
    prioridad: 'Media',
    fecha_limite: '',
    siguiente_paso: '',
    bloqueos: '',
    notas: '',
    tipo_proyecto: 'Proyecto'
  })

  // Cargar proyectos
  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterResponsable) params.append('responsable', filterResponsable)

      const response = await fetch(
        `${API_URL}/projects?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } }
      )

      if (!response.ok) {
        if (response.status === 401) {
          setError('No autenticado. Por favor, inicia sesión.')
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setProjects(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando proyectos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [filterStatus, filterResponsable])

  // Crear proyecto
  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setShowForm(false)
      setFormData({
        name: '',
        bac: 50000,
        responsable: '',
        estado: 'Activo',
        prioridad: 'Media',
        fecha_limite: '',
        siguiente_paso: '',
        bloqueos: '',
        notas: '',
        tipo_proyecto: 'Proyecto'
      })
      fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando proyecto')
    }
  }

  // Editar campo inline
  const handleInlineEdit = async (projectId: string, field: string, value: string, version: number) => {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ [field === 'siguiente_paso' ? 'siguiente_paso' : field]: value, version })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setEditingField(null)
      fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error actualizando ${field}`)
    }
  }

  // Eliminar proyecto
  const handleDelete = async (projectId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) return

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando proyecto')
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Gestor de Proyectos</h1>
            <p className="dashboard-subtitle">Gestiona tu cartera de proyectos</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Estado</label>
            <input
              type="text"
              placeholder="Filtrar por estado..."
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <label>Responsable</label>
            <input
              type="text"
              placeholder="Filtrar por responsable..."
              value={filterResponsable}
              onChange={(e) => setFilterResponsable(e.target.value)}
              className="form-input"
            />
          </div>
          <button onClick={() => { setFilterStatus(''); setFilterResponsable('') }} className="filter-button">
            Limpiar filtros
          </button>
        </div>

        {/* Botón crear */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Proyecto'}
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="form-section">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">BAC</label>
                <input type="number" value={formData.bac} onChange={(e) => setFormData({...formData, bac: Number(e.target.value)})} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Responsable</label>
                <input type="text" value={formData.responsable} onChange={(e) => setFormData({...formData, responsable: e.target.value})} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="form-input">
                  <option>Activo</option>
                  <option>En Pausa</option>
                  <option>Completado</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value})} className="form-input">
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Límite</label>
                <input type="date" value={formData.fecha_limite} onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})} className="form-input" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Siguiente Paso</label>
                <input type="text" value={formData.siguiente_paso} onChange={(e) => setFormData({...formData, siguiente_paso: e.target.value})} className="form-input" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Notas</label>
                <textarea value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} className="form-input form-textarea" rows={3} />
              </div>
            </div>
            <button onClick={handleCreate} className="btn btn-primary">
              Guardar Proyecto
            </button>
          </div>
        )}

        {/* Tabla de proyectos */}
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No hay proyectos</div>
            {!filterStatus && !filterResponsable && <p>Crea uno nuevo.</p>}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Siguiente Paso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.responsable}</td>
                    <td><span className="badge badge-success">{p.estado}</span></td>
                    <td>{p.prioridad || '-'}</td>
                    <td>
                      {editingField === `${p.id}-siguiente_paso` ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={p.siguiente_paso || ''}
                          onBlur={(e) => handleInlineEdit(p.id, 'siguiente_paso', e.currentTarget.value, p.version)}
                          onKeyDown={(e) => e.key === 'Enter' && handleInlineEdit(p.id, 'siguiente_paso', e.currentTarget.value, p.version)}
                          className="inline-edit-input"
                        />
                      ) : (
                        <span onDoubleClick={() => setEditingField(`${p.id}-siguiente_paso`)} className="inline-edit">
                          {p.siguiente_paso || '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
