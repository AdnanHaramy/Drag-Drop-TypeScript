import { Draggable } from '../Models/drag-drop.js'
import {Component} from '../components/base-component.js'
import {Project } from '../Models/project.js'
    export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        get persons() {
            if (this.project.people === 1) {
                return '1 Person ';
            }
            else {
                return `${this.project.people} Persons `;
            }
        }
        private project: Project;
        constructor(hostId: string, project: Project) {
            super('single-project', hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        dragStartHandler(event: DragEvent) {
            // the data that is transfered is plain text
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
        }
        dragEndHandler(_: DragEvent) {
            console.log('DragEnded')
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent() {
            // rendered li element
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons + 'assigned ';
            this.element.querySelector('p')!.textContent = this.project.description;
        }
    }