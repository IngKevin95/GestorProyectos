import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useProjectStore } from "../store/projectStore";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";
import type { Project, ProjectInput, ProjectUpdate } from "../types";

export function ProjectsPage() {
  const {
    projects,
    selectedProject,
    isLoading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    filters,
    setFilters,
  } = useProjectStore();

  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects(filters);
  }, [filters, fetchProjects]);

  const handleCreateProject = async (data: ProjectInput) => {
    await createProject(data);
    setShowCreateForm(false);
    await fetchProjects(filters);
  };

  const handleEditProject = (id: string) => {
    const safeProjects = projects || [];
    const project = safeProjects.find((p) => p.id === id);
    if (project) {
      setEditingProject(project);
      setShowEditForm(true);
    }
  };

  const handleUpdateProject = async (data: ProjectUpdate) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setShowEditForm(false);
      setEditingProject(null);
      await fetchProjects(filters);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    await fetchProjects(filters);
  };

  const handleViewDetail = (id: string) => {
    fetchProject(id);
    navigate(`/projects/${id}`);
  };

  const handleInlineEdit = async (id: string, field: string, value: string) => {
    const safeProjects = projects || [];
    const project = safeProjects.find((p) => p.id === id);
    if (project) {
      await updateProject(id, { ...project, [field]: value });
      await fetchProjects(filters);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Proyectos</h1>
          <button
            type="button"
            className="px-6 py-3 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => setShowCreateForm(true)}
          >
            Nuevo Proyecto
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <ProjectList
            projects={projects || []}
            isLoading={isLoading}
            filters={filters}
            onFilterChange={setFilters}
            onViewDetail={handleViewDetail}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onCreateNew={() => setShowCreateForm(true)}
            onInlineEdit={handleInlineEdit}
          />
        )}

        <ProjectForm
          open={showCreateForm}
          onSubmit={handleCreateProject}
          onClose={() => setShowCreateForm(false)}
          isLoading={isLoading}
        />

        {editingProject && (
          <ProjectForm
            open={showEditForm}
            project={editingProject}
            onSubmit={handleUpdateProject}
            onClose={() => { setShowEditForm(false); setEditingProject(null); }}
            isLoading={isLoading}
          />
        )}
      </div>
    </Layout>
  );
}
