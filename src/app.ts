///  <reference path = 'drag-drop-interfaces.ts'/>
///  <reference path = 'project-model.ts'/>

namespace App {
    type Listener<T> = (items: T[]) => void;
    class State<T> {
        protected listeners: Listener<T>[] = [];
        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }
    // Project State Management 
    class ProjectState extends State<Project> {
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

    const projectstate = ProjectState.getInstance();



    // Reusable Validation Logic 
    // required and minLength and maxLength and min and max should be optional
    interface Validatable {
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }
    // gets an object which has the validatable structure 
    function validate(validatableInput: Validatable) {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        // the minLength is set and its of type string 
        if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }

    // Component Base Class to make the code more reusable 
    // we used abstract to force the inherited class to inherit the configure method and the renderContent Method
    abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement;
        hostElement: T;
        element: U;
        constructor(
            templateId: string,
            hostElementId: string,
            insertAtStart: boolean,
            newElementId?: string,
        ) {
            this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as T;
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild as U;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart)
        }
        // method that insert's an html element 
        private attach(insertAtBeginning: boolean) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }
        abstract configure(): void;
        abstract renderContent(): void;
    }
    class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
    // ProjectList Class
    class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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


    class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        // properties and thier types
        titelInputElement: HTMLInputElement;
        descriptionlInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;
        constructor() {
            // Access to the elements inside the DOM
            super('project-input', 'app', true, 'user-input');
            this.titelInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionlInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
            this.configure();

        }

        configure() {
            this.element.addEventListener('submit', this.sumbitHandler.bind(this));
        }
        renderContent(): void {

        }
        // a method that validates user input and checks it 
        private gatherUserInput(): [string, string, number] | void {
            const enteredTitle = this.titelInputElement.value;
            const enteredDescription = this.descriptionlInputElement.value;
            const enteredPeople = this.peopleInputElement.value;

            const titleValidatable: Validatable = {
                value: enteredTitle,
                required: true,
            };
            const descriptionValidatable: Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            };
            const peopleValidatable: Validatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5
            };


            if (
                !validate(titleValidatable) ||
                !validate(descriptionValidatable) ||
                !validate(peopleValidatable)
            ) {
                alert('invalid input please try again ')
                return;
            }
            else {
                return [enteredTitle, enteredDescription, parseFloat(enteredPeople)];
            }
        }
        // a method to clear the form after checking if it is validatable 
        private clearInputs() {
            this.titelInputElement.value = '';
            this.descriptionlInputElement.value = '';
            this.peopleInputElement.value = '';
        }
        private sumbitHandler(event: Event) {
            // the default behavior is to send an http request
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, desc, people] = userInput;
                projectstate.addProject(title, desc, people);
                this.clearInputs()
            }
        }
    }
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}
