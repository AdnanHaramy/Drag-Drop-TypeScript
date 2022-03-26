     import { Component } from "./base-component.js";
     import { Project } from "../Models/project.js";
     import { ProjectItem } from "./project-item.js";
     import { DragTarget } from "../Models/drag-drop.js";
     import { ProjectStatus } from "../Models/project.js";
     import { projectstate } from "../State/project-state.js";
     // ProjectList Class
      export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[];
        // because we set the type inside of the constructor every project list should be either active or inactive (finished)
        constructor(private type: 'active' | 'finished') {
            // Access to the elements inside the DOM
            super('project-list', 'app', false, `${type}-projects`);
            this.assignedProjects = [];
            this.configure();
            this.renderContent()
        }
        private renderProjects() {
            const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
            listElement.innerHTML = '';
            for (const projectItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
            }
        }
        // to visulaize that the finished projects is a droppable area 
        dragOverHandler(event: DragEvent) {
            // access to the UL
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEL = this.element.querySelector('ul')!;
                listEL.classList.add('droppable');
            }
        }

        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData('text/plain');
            projectstate.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);

        }
        dragLeaveHandler(_: DragEvent) {
            const listEL = this.element.querySelector('ul')!;
            listEL.classList.remove('droppable');
        }
        configure(): void {
            this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
            this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
            this.element.addEventListener('drop', this.dropHandler.bind(this));

            projectstate.addListener((projects: Project[]) => {
                const relevantProjects = projects.filter(project => {
                    if (this.type === 'active') {
                        return project.status === ProjectStatus.Active;
                    }
                    return project.status === ProjectStatus.Finished;

                })
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });

        }
        renderContent() {
            const listId = `${this.type}-projects-list`
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
        }
    }