import { useState, useEffect } from 'react'

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
  const [editingId, setEditingId] = useState<string | null>(null)
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Gestor de Proyectos</h1>
        <p className="text-gray-600 mb-8">Gestiona tu cartera de proyectos</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Filtrar por estado..."
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Filtrar por responsable..."
            value={filterResponsable}
            onChange={(e) => setFilterResponsable(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button onClick={() => { setFilterStatus(''); setFilterResponsable('') }} className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg">
            Limpiar filtros
          </button>
        </div>

        {/* Botón crear */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Proyecto'}
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="number" placeholder="BAC" value={formData.bac} onChange={(e) => setFormData({...formData, bac: Number(e.target.value)})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Responsable" value={formData.responsable} onChange={(e) => setFormData({...formData, responsable: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option>Activo</option>
                <option>En Pausa</option>
                <option>Completado</option>
                <option>Cancelado</option>
              </select>
              <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
              <input type="date" value={formData.fecha_limite} onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Siguiente paso" value={formData.siguiente_paso} onChange={(e) => setFormData({...formData, siguiente_paso: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg col-span-2" />
              <textarea placeholder="Notas" value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg col-span-2" rows={3} />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Guardar Proyecto
            </button>
          </div>
        )}

        {/* Tabla de proyectos */}
        {loading ? (
          <p>Cargando...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">No hay proyectos. {!filterStatus && !filterResponsable && 'Crea uno nuevo.'}</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Responsable</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Prioridad</th>
                  <th className="p-3 text-left">Siguiente Paso</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.responsable}</td>
                    <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{p.estado}</span></td>
                    <td className="p-3">{p.prioridad || '-'}</td>
                    <td className="p-3">
                      {editingField === `${p.id}-siguiente_paso` ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={p.siguiente_paso || ''}
                          onBlur={(e) => handleInlineEdit(p.id, 'siguiente_paso', e.currentTarget.value, p.version)}
                          onKeyDown={(e) => e.key === 'Enter' && handleInlineEdit(p.id, 'siguiente_paso', e.currentTarget.value, p.version)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span onDoubleClick={() => setEditingField(`${p.id}-siguiente_paso`)} className="cursor-pointer hover:underline">
                          {p.siguiente_paso || '-'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
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
