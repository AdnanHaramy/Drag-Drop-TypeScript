    import {Project } from '../Models/project.js'
    import { ProjectStatus } from "../Models/project.js";
    type Listener<T> = (items: T[]) => void;
    class State<T> {
        protected listeners: Listener<T>[] = [];
        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }
    // Project State Management 
    export class ProjectState extends State<Project> {
        private projects: Project[] = [];
        private static instance: ProjectState;
        private constructor() {
            super();
        }
        static getInstance() {
            if (this.instance) {
                return this.instance
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addProject(title: string, description: string, numOfPeople: number) {
            // every project by default should be in an active status
            const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        // to switch the status of the project from the list currently in to a new list
        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project) {
                project.status = newStatus;
                this.updateListeners();
            }
        }


        private updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }

    export const projectstate = ProjectState.getInstance();