/**
 * Translation dictionary for GestorProyectos.
 * Keyed by language prefix (es, en, pt).
 */

export type LangKey = "es" | "en" | "pt";

export type TranslationDict = Record<string, string>;

const es: TranslationDict = {
  /* Navigation */
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.settings": "Configuración",
  "nav.templates": "Plantillas",
  "nav.profiles": "Perfiles",
  "nav.profile": "Mi Perfil",
  "nav.logout": "Cerrar Sesión",
  "nav.platform_name": "GestorProyectos",

  /* Common actions */
  "action.save": "Guardar",
  "action.saving": "Guardando...",
  "action.cancel": "Cancelar",
  "action.edit": "Editar",
  "action.delete": "Eliminar",
  "action.confirm": "Confirmar",
  "action.close": "Cerrar",
  "action.back": "Volver",
  "action.create": "Crear",
  "action.loading": "Cargando...",
  "action.search": "Buscar",

  /* Dashboard */
  "dashboard.projects": "Proyectos",
  "dashboard.new": "+ Nuevo",
  "dashboard.loading": "Cargando...",
  "dashboard.empty": "Aún no hay proyectos. Crea tu primer proyecto.",
  "dashboard.select_project": "Selecciona un proyecto para ver indicadores KPI",
  "dashboard.new_project": "Nuevo Proyecto",
  "dashboard.project_name": "Nombre del proyecto",
  "dashboard.name_placeholder": "Mi Proyecto",
  "dashboard.budget": "Presupuesto (BAC)",
  "dashboard.create_project": "Crear Proyecto",
  "dashboard.creating": "Creando...",
  "dashboard.name_required": "El nombre es requerido y el BAC debe ser > 0",
  "dashboard.view_details": "Ver detalles",
  "dashboard.view_kpi": "Ver KPI",
  "dashboard.control_panel": "Panel de Control",
  "dashboard.dashboard_subtitle": "Panel de Control — Sistema de gestión de proyectos operativo",
  "dashboard.delete_confirm": "¿Eliminar",

  /* Project Detail */
  "project.bac": "BAC",
  "project.created": "Creado",
  "project.change_state": "Cambiar Estado",
  "project.reopen": "Reabrir Proyecto",
  "project.edit": "Editar",
  "project.delete": "Eliminar",
  "project.phases": "Fases y Actividades",
  "project.kpi": "Analítica KPI",
  "project.audit": "Auditoría",
  "project.import_export": "Importar / Exportar",
  "project.no_kpi": "Sin datos KPI",
  "project.edit_title": "Editar Proyecto",
  "project.save": "Guardar",
  "project.back_dashboard": "Dashboard",

  /* Settings */
  "settings.title": "Configuración del Sistema",
  "settings.subtitle": "Regionalización, moneda y formato numérico",
  "settings.preview": "Vista previa de formato de moneda",
  "settings.country": "País",
  "settings.currency": "Moneda",
  "settings.timezone": "Zona horaria",
  "settings.language": "Idioma",
  "settings.date_format": "Formato de fecha",
  "settings.thousand_sep": "Separador de miles",
  "settings.decimal_sep": "Separador decimal",
  "settings.save": "Guardar configuración",
  "settings.saved": "Configuración guardada",
  "settings.save_error": "Error al guardar configuración",
  "settings.regionalization": "Regionalización",
  "settings.lang_timezone": "Idioma y zona horaria",
  "settings.numeric_format": "Formato numérico y fecha",

  /* Login */
  "login.email": "Correo electrónico",
  "login.password": "Contraseña",
  "login.submit": "Iniciar Sesión",
  "login.loading": "Iniciando sesión...",
  "login.error_default": "Credenciales inválidas",
  "login.welcome": "Bienvenido",
  "login.subtitle": "Sistema de gestión de proyectos operativo",

  /* Profile */
  "profile.title": "Mi Perfil",
  "profile.loading": "Cargando perfil...",
  "profile.role_admin": "Administrador",
  "profile.role_user": "Usuario",

  /* Admin */
  "admin.title": "Panel de Administración",
  "admin.users": "Usuarios",
  "admin.roles": "Roles",

  /* Templates */
  "templates.title": "Plantillas de Proyectos",

  /* Profiles */
  "profiles.title": "Perfiles de Costo",
  "profiles.subtitle": "Gestione perfiles con tarifas por hora para el cálculo automático del BAC",
  "profiles.create": "Nuevo Perfil",
  "profiles.edit": "Editar Perfil",
  "profiles.name": "Nombre",
  "profiles.hourly_rate": "Tarifa/Hora",
  "profiles.status": "Estado",
  "profiles.actions": "Acciones",
  "profiles.active": "Activo",
  "profiles.inactive": "Inactivo",
  "profiles.empty": "Sin perfiles",
  "profiles.empty_desc": "Cree un perfil para calcular automáticamente el BAC de las actividades",
  "profiles.created": "Perfil creado",
  "profiles.updated": "Perfil actualizado",
  "profiles.deleted": "Perfil eliminado",
  "profiles.confirm_delete": "¿Eliminar el perfil",
  "profiles.save_error": "Error al guardar el perfil",

  /* KPI AC vs BAC */
  "kpi.actual_cost": "Costo Real (AC)",
  "kpi.budget": "Presupuesto (BAC)",
  "kpi.ac_vs_bac": "AC vs BAC",

  /* States */
  "state.PLANNING": "Planificación",
  "state.ACTIVE": "Activo",
  "state.PAUSED": "Pausado",
  "state.COMPLETED": "Completado",
  "state.CANCELLED": "Cancelado",
};

const en: TranslationDict = {
  /* Navigation */
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.settings": "Settings",
  "nav.templates": "Templates",
  "nav.profiles": "Profiles",
  "nav.profile": "My Profile",
  "nav.logout": "Sign Out",
  "nav.platform_name": "GestorProyectos",

  /* Common actions */
  "action.save": "Save",
  "action.saving": "Saving...",
  "action.cancel": "Cancel",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.confirm": "Confirm",
  "action.close": "Close",
  "action.back": "Back",
  "action.create": "Create",
  "action.loading": "Loading...",
  "action.search": "Search",

  /* Dashboard */
  "dashboard.projects": "Projects",
  "dashboard.new": "+ New",
  "dashboard.loading": "Loading...",
  "dashboard.empty": "No projects yet. Create your first project.",
  "dashboard.select_project": "Select a project to view KPI indicators",
  "dashboard.new_project": "New Project",
  "dashboard.project_name": "Project name",
  "dashboard.name_placeholder": "My Project",
  "dashboard.budget": "Budget (BAC)",
  "dashboard.create_project": "Create Project",
  "dashboard.creating": "Creating...",
  "dashboard.name_required": "Name is required and BAC must be > 0",
  "dashboard.view_details": "View details",
  "dashboard.view_kpi": "View KPI",
  "dashboard.control_panel": "Control Panel",
  "dashboard.dashboard_subtitle": "Control Panel — Project Management System",
  "dashboard.delete_confirm": "Delete",

  /* Project Detail */
  "project.bac": "BAC",
  "project.created": "Created",
  "project.change_state": "Change State",
  "project.reopen": "Reopen Project",
  "project.edit": "Edit",
  "project.delete": "Delete",
  "project.phases": "Phases & Activities",
  "project.kpi": "KPI Analytics",
  "project.audit": "Audit Trail",
  "project.import_export": "Import / Export",
  "project.no_kpi": "No KPI data",
  "project.edit_title": "Edit Project",
  "project.save": "Save",
  "project.back_dashboard": "Dashboard",

  /* Settings */
  "settings.title": "System Settings",
  "settings.subtitle": "Regionalization, currency and numeric format",
  "settings.preview": "Currency format preview",
  "settings.country": "Country",
  "settings.currency": "Currency",
  "settings.timezone": "Timezone",
  "settings.language": "Language",
  "settings.date_format": "Date format",
  "settings.thousand_sep": "Thousands separator",
  "settings.decimal_sep": "Decimal separator",
  "settings.save": "Save settings",
  "settings.saved": "Settings saved",
  "settings.save_error": "Error saving settings",
  "settings.regionalization": "Regionalization",
  "settings.lang_timezone": "Language and timezone",
  "settings.numeric_format": "Numeric and date format",

  /* Login */
  "login.email": "Email address",
  "login.password": "Password",
  "login.submit": "Sign In",
  "login.loading": "Signing in...",
  "login.error_default": "Invalid credentials",
  "login.welcome": "Welcome",
  "login.subtitle": "Project Management System",

  /* Profile */
  "profile.title": "My Profile",
  "profile.loading": "Loading profile...",
  "profile.role_admin": "Administrator",
  "profile.role_user": "User",

  /* Admin */
  "admin.title": "Administration Panel",
  "admin.users": "Users",
  "admin.roles": "Roles",

  /* Templates */
  "templates.title": "Project Templates",

  /* Profiles */
  "profiles.title": "Cost Profiles",
  "profiles.subtitle": "Manage profiles with hourly rates for automatic BAC calculation",
  "profiles.create": "New Profile",
  "profiles.edit": "Edit Profile",
  "profiles.name": "Name",
  "profiles.hourly_rate": "Hourly Rate",
  "profiles.status": "Status",
  "profiles.actions": "Actions",
  "profiles.active": "Active",
  "profiles.inactive": "Inactive",
  "profiles.empty": "No profiles",
  "profiles.empty_desc": "Create a profile to automatically calculate activity BAC",
  "profiles.created": "Profile created",
  "profiles.updated": "Profile updated",
  "profiles.deleted": "Profile deleted",
  "profiles.confirm_delete": "Delete profile",
  "profiles.save_error": "Error saving profile",

  /* KPI AC vs BAC */
  "kpi.actual_cost": "Actual Cost (AC)",
  "kpi.budget": "Budget (BAC)",
  "kpi.ac_vs_bac": "AC vs BAC",

  /* States */
  "state.PLANNING": "Planning",
  "state.ACTIVE": "Active",
  "state.PAUSED": "Paused",
  "state.COMPLETED": "Completed",
  "state.CANCELLED": "Cancelled",
};

const pt: TranslationDict = {
  /* Navigation */
  "nav.dashboard": "Painel",
  "nav.admin": "Admin",
  "nav.settings": "Configurações",
  "nav.templates": "Modelos",
  "nav.profiles": "Perfis",
  "nav.profile": "Meu Perfil",
  "nav.logout": "Sair",
  "nav.platform_name": "GestorProyectos",

  /* Common actions */
  "action.save": "Salvar",
  "action.saving": "Salvando...",
  "action.cancel": "Cancelar",
  "action.edit": "Editar",
  "action.delete": "Excluir",
  "action.confirm": "Confirmar",
  "action.close": "Fechar",
  "action.back": "Voltar",
  "action.create": "Criar",
  "action.loading": "Carregando...",
  "action.search": "Buscar",

  /* Dashboard */
  "dashboard.projects": "Projetos",
  "dashboard.new": "+ Novo",
  "dashboard.loading": "Carregando...",
  "dashboard.empty": "Nenhum projeto ainda. Crie seu primeiro projeto.",
  "dashboard.select_project": "Selecione um projeto para ver indicadores KPI",
  "dashboard.new_project": "Novo Projeto",
  "dashboard.project_name": "Nome do projeto",
  "dashboard.name_placeholder": "Meu Projeto",
  "dashboard.budget": "Orçamento (BAC)",
  "dashboard.create_project": "Criar Projeto",
  "dashboard.creating": "Criando...",
  "dashboard.name_required": "Nome é obrigatório e BAC deve ser > 0",
  "dashboard.view_details": "Ver detalhes",
  "dashboard.view_kpi": "Ver KPI",
  "dashboard.control_panel": "Painel de Controle",
  "dashboard.dashboard_subtitle": "Painel de Controle — Sistema de gestão de projetos operacional",
  "dashboard.delete_confirm": "Excluir",

  /* Project Detail */
  "project.bac": "OAP",
  "project.created": "Criado",
  "project.change_state": "Mudar Estado",
  "project.reopen": "Reabrir Projeto",
  "project.edit": "Editar",
  "project.delete": "Excluir",
  "project.phases": "Fases e Atividades",
  "project.kpi": "Análise KPI",
  "project.audit": "Auditoria",
  "project.import_export": "Importar / Exportar",
  "project.no_kpi": "Sem dados KPI",
  "project.edit_title": "Editar Projeto",
  "project.save": "Salvar",
  "project.back_dashboard": "Painel",

  /* Settings */
  "settings.title": "Configurações do Sistema",
  "settings.subtitle": "Regionalização, moeda e formato numérico",
  "settings.preview": "Prévia do formato de moeda",
  "settings.country": "País",
  "settings.currency": "Moeda",
  "settings.timezone": "Fuso horário",
  "settings.language": "Idioma",
  "settings.date_format": "Formato de data",
  "settings.thousand_sep": "Separador de milhares",
  "settings.decimal_sep": "Separador decimal",
  "settings.save": "Salvar configurações",
  "settings.saved": "Configurações salvas",
  "settings.save_error": "Erro ao salvar configurações",
  "settings.regionalization": "Regionalização",
  "settings.lang_timezone": "Idioma e fuso horário",
  "settings.numeric_format": "Formato numérico e data",

  /* Login */
  "login.email": "E-mail",
  "login.password": "Senha",
  "login.submit": "Entrar",
  "login.loading": "Entrando...",
  "login.error_default": "Credenciais inválidas",
  "login.welcome": "Bem-vindo",
  "login.subtitle": "Sistema de gestão de projetos operacional",

  /* Profile */
  "profile.title": "Meu Perfil",
  "profile.loading": "Carregando perfil...",
  "profile.role_admin": "Administrador",
  "profile.role_user": "Usuário",

  /* Admin */
  "admin.title": "Painel Administrativo",
  "admin.users": "Usuários",
  "admin.roles": "Funções",

  /* Templates */
  "templates.title": "Modelos de Projetos",

  /* Profiles */
  "profiles.title": "Perfis de Custo",
  "profiles.subtitle": "Gerencie perfis com tarifas por hora para o cálculo automático do BAC",
  "profiles.create": "Novo Perfil",
  "profiles.edit": "Editar Perfil",
  "profiles.name": "Nome",
  "profiles.hourly_rate": "Tarifa/Hora",
  "profiles.status": "Status",
  "profiles.actions": "Ações",
  "profiles.active": "Ativo",
  "profiles.inactive": "Inativo",
  "profiles.empty": "Sem perfis",
  "profiles.empty_desc": "Crie um perfil para calcular automaticamente o BAC das atividades",
  "profiles.created": "Perfil criado",
  "profiles.updated": "Perfil atualizado",
  "profiles.deleted": "Perfil excluído",
  "profiles.confirm_delete": "Excluir perfil",
  "profiles.save_error": "Erro ao salvar perfil",

  /* KPI AC vs BAC */
  "kpi.actual_cost": "Custo Real (AC)",
  "kpi.budget": "Orçamento (BAC)",
  "kpi.ac_vs_bac": "AC vs BAC",

  /* States */
  "state.PLANNING": "Planejamento",
  "state.ACTIVE": "Ativo",
  "state.PAUSED": "Pausado",
  "state.COMPLETED": "Concluído",
  "state.CANCELLED": "Cancelado",
};

export const TRANSLATIONS: Record<LangKey, TranslationDict> = { es, en, pt };

/** Resolve a locale string like "es-CO", "en-US", "pt-BR" → LangKey */
export function resolveLangKey(locale: string): LangKey {
  const prefix = locale.split("-")[0].toLowerCase() as LangKey;
  return prefix in TRANSLATIONS ? prefix : "es";
}
