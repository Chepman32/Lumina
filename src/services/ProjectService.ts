import { MMKV } from 'react-native-mmkv';
import type { EditorState } from '../types/editor.types';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  thumbnail?: string; // Base64 thumbnail
  editorState: EditorState;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  thumbnail?: string;
}

let storage: MMKV;

try {
  storage = new MMKV({
    id: 'projects',
    encryptionKey: 'lumina_projects_key',
  });
} catch (error) {
  console.error('Failed to initialize MMKV storage:', error);
  // Fallback to basic MMKV without encryption
  storage = new MMKV({
    id: 'projects',
  });
}

export class ProjectService {
  private static readonly PROJECTS_KEY = 'projects_list';
  private static readonly PROJECT_PREFIX = 'project_';

  /**
   * Save a project
   */
  static async saveProject(
    project: Omit<Project, 'id' | 'createdAt' | 'modifiedAt'>,
  ): Promise<string> {
    try {
      const now = Date.now();
      const projectId = `proj_${now}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const fullProject: Project = {
        id: projectId,
        createdAt: now,
        modifiedAt: now,
        ...project,
      };

      // Save project data
      storage.set(
        `${this.PROJECT_PREFIX}${projectId}`,
        JSON.stringify(fullProject),
      );

      // Update projects list
      const projects = this.getProjectsList();
      const metadata: ProjectMetadata = {
        id: projectId,
        name: fullProject.name,
        createdAt: fullProject.createdAt,
        modifiedAt: fullProject.modifiedAt,
        thumbnail: fullProject.thumbnail,
      };

      projects.push(metadata);
      storage.set(this.PROJECTS_KEY, JSON.stringify(projects));

      return projectId;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>,
  ): Promise<void> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject: Project = {
      ...project,
      ...updates,
      modifiedAt: Date.now(),
    };

    // Save updated project
    storage.set(
      `${this.PROJECT_PREFIX}${projectId}`,
      JSON.stringify(updatedProject),
    );

    // Update projects list
    const projects = this.getProjectsList();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = {
        id: updatedProject.id,
        name: updatedProject.name,
        createdAt: updatedProject.createdAt,
        modifiedAt: updatedProject.modifiedAt,
        thumbnail: updatedProject.thumbnail,
      };
      storage.set(this.PROJECTS_KEY, JSON.stringify(projects));
    }
  }

  /**
   * Get a project by ID
   */
  static getProject(projectId: string): Project | null {
    try {
      const projectData = storage.getString(
        `${this.PROJECT_PREFIX}${projectId}`,
      );
      if (!projectData) return null;

      return JSON.parse(projectData);
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  /**
   * Get all projects metadata
   */
  static getProjectsList(): ProjectMetadata[] {
    try {
      const projectsData = storage.getString(this.PROJECTS_KEY);
      if (!projectsData) return [];

      return JSON.parse(projectsData);
    } catch (error) {
      console.error('Failed to get projects list:', error);
      return [];
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: string): Promise<void> {
    // Remove project data
    storage.delete(`${this.PROJECT_PREFIX}${projectId}`);

    // Update projects list
    const projects = this.getProjectsList();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    storage.set(this.PROJECTS_KEY, JSON.stringify(filteredProjects));
  }

  /**
   * Duplicate a project
   */
  static async duplicateProject(projectId: string): Promise<string> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const duplicatedProject = {
      name: `${project.name} Copy`,
      thumbnail: project.thumbnail,
      editorState: { ...project.editorState },
    };

    return this.saveProject(duplicatedProject);
  }

  /**
   * Get projects sorted by modification date
   */
  static getRecentProjects(limit?: number): ProjectMetadata[] {
    const projects = this.getProjectsList();
    const sorted = projects.sort((a, b) => b.modifiedAt - a.modifiedAt);

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Search projects by name
   */
  static searchProjects(query: string): ProjectMetadata[] {
    const projects = this.getProjectsList();
    const lowercaseQuery = query.toLowerCase();

    return projects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery),
    );
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): { projectCount: number; totalSize: number } {
    const projects = this.getProjectsList();

    // Rough estimation of storage size
    let totalSize = 0;
    projects.forEach(project => {
      const projectData = storage.getString(
        `${this.PROJECT_PREFIX}${project.id}`,
      );
      if (projectData) {
        totalSize += projectData.length;
      }
    });

    return {
      projectCount: projects.length,
      totalSize: Math.round(totalSize / 1024), // Convert to KB
    };
  }

  /**
   * Export project data (for backup)
   */
  static exportProject(projectId: string): string | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project data (from backup)
   */
  static async importProject(projectData: string): Promise<string> {
    try {
      const project = JSON.parse(projectData) as Project;

      // Generate new ID to avoid conflicts
      const importedProject = {
        name: `${project.name} (Imported)`,
        thumbnail: project.thumbnail,
        editorState: project.editorState,
      };

      return this.saveProject(importedProject);
    } catch (error) {
      throw new Error('Invalid project data');
    }
  }

  /**
   * Clear all projects (for testing/reset)
   */
  static clearAllProjects(): void {
    const projects = this.getProjectsList();

    // Delete all project data
    projects.forEach(project => {
      storage.delete(`${this.PROJECT_PREFIX}${project.id}`);
    });

    // Clear projects list
    storage.delete(this.PROJECTS_KEY);
  }
}
