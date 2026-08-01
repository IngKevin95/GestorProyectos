-- EP-004: Task statistics columns
-- Run once against gestor_proyectos if open_tasks / overdue_tasks are missing.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE projects ADD COLUMN IF NOT EXISTS open_tasks    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS overdue_tasks INTEGER NOT NULL DEFAULT 0;
