import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useProjectStore } from "../store/projectStore";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";
import { ProjectDetail } from "../components/ProjectDetail";
import type { Project } from "../types";

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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects(filters);
  }, [filters]);

  const handleCreateProject = async (data: any) => {
    await createProject(data);
    setShowCreateForm(false);
  };

  const handleEditProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setEditingProject(project);
      setShowEditForm(true);
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setShowEditForm(false);
      setEditingProject(null);
    }
  };

  const handleViewDetail = async (id: string) => {
    await fetchProject(id);
    setShowDetail(true);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Proyectos</h1>
            <p className="text-slate-600 mt-1">Gestiona la cartera de proyectos</p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setShowCreateForm(true);
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            + Crear Proyecto
          </button>
        </div>
      </div>

      {/* Proyecto List */}
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        onViewDetail={handleViewDetail}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onCreateNew={() => {
          setEditingProject(null);
          setShowCreateForm(true);
        }}
        onInlineEdit={async (id, field, value) => {
          const p = projects.find((proj) => proj.id === id);
          if (p) {
            await updateProject(id, { [field]: value, version: p.version || 1 });
          }
        }}
      />

      {/* Modales */}
      <ProjectForm
        open={showCreateForm}
        project={showEditForm ? editingProject || undefined : undefined}
        onSubmit={showEditForm ? handleUpdateProject : handleCreateProject}
        onClose={() => {
          setShowCreateForm(false);
          setShowEditForm(false);
          setEditingProject(null);
        }}
        isLoading={isLoading}
      />

      <ProjectForm
        open={showEditForm}
        project={editingProject || undefined}
        onSubmit={handleUpdateProject}
        onClose={() => {
          setShowEditForm(false);
          setEditingProject(null);
        }}
        isLoading={isLoading}
      />

      <ProjectDetail
        isOpen={showDetail}
        project={selectedProject}
        isLoading={isLoading}
        onClose={() => setShowDetail(false)}
        onEdit={() => {
          setShowDetail(false);
          handleEditProject(selectedProject?.id || "");
        }}
        onDelete={async () => {
          if (selectedProject) {
            await handleDeleteProject(selectedProject.id);
            setShowDetail(false);
          }
        }}
      />
    </Layout>
  );
}
