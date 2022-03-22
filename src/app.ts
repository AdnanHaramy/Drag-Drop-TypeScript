// Project Type
enum ProjectStatus {
    Active, Finished
}
class Project {
    constructor(
        public id : string,
        public title : string,
        public description : string,
        public people : number,
        public status : ProjectStatus,
    ) {}
}
type Listener = (items : Project[]) => void;
// Project State Management 
class ProjectState { 
    private listeners : Listener [] = [];
    private projects : Project[] =[];
    private static instance : ProjectState;
    private constructor() {

    }
    static getInstance() {
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn : Listener) {
        this.listeners.push(listenerFn);
    }
    addProject( title: string , description :string , numOfPeople : number ) {
        // every project by default should be in an active status
        const newProject = new Project(Math.random().toString(),title,description,numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for(const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectstate = ProjectState.getInstance();



// Reusable Validation Logic 
// required and minLength and maxLength and min and max should be optional
interface Validatable {
    value : string | number;
    required? : boolean ;
    minLength? : number ;
    maxLength? : number;
    min? : number;
    max?: number; 
}
// gets an object which has the validatable structure 
function validate(validatableInput : Validatable) {
    let isValid = true;
    if(validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0 ;
    }
    // the minLength is set and its of type string 
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid =isValid && validatableInput.value >= validatableInput.min ;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid =isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// Component Base Class to make the code more reusable 
class Component <T extends HTMLElement , U extends HTMLElement> {
    templateElement : HTMLTemplateElement;
    hostElement : T;
    element : U;
    constructor (
        templateId : string ,
        hostElementId : string ,
        insertAtStart : boolean,
        newElementId ?: string,
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content,true);
            this.element = importedNode.firstElementChild as U ;
            if(newElementId) {
                this.element.id = newElementId;
            }    
        this.attach()
    }
    private attach () {
        this.hostElement.insertAdjacentElement('beforeend',this.element );

    }
}



// ProjectList Class
class ProjectList {
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLElement;
    assignedProjects : Project[];
    // because we set the type inside of the constructor every project list should be either active or inactive (finished)
    constructor (private type : 'active' | 'finished') {
            // Access to the elements inside the DOM
            this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
            this.hostElement = document.getElementById('app')! as HTMLDivElement;
            const importedNode = document.importNode(this.templateElement.content,true);
            this.element = importedNode.firstElementChild as HTMLElement ;
            this.assignedProjects = [];
            this.element.id = `${this.type}-projects`;
            projectstate.addListener( (projects : Project[])=> {
                const relevantProjects = projects.filter(project => {
                    if(this.type === 'active') {
                        return project.status === ProjectStatus.Active;
                    }
                    return project.status === ProjectStatus.Finished;

                })
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
            this.attach()
            this.renderContent()
    }
    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElement.appendChild(listItem);
        }
    }
    private renderContent () {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    private attach () {
        this.hostElement.insertAdjacentElement('beforeend',this.element );

    }
}


class ProjectInput {
    // properties and thier types
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLFormElement;
    titelInputElement : HTMLInputElement;
    descriptionlInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;
    constructor() {
        // Access to the elements inside the DOM
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        const importedNode = document.importNode(this.templateElement.content,true);
        this.element = importedNode.firstElementChild as HTMLFormElement ;
        this.element.id = 'user-input';
        this.titelInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionlInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
        this.configure();
        this.attach()

    }
    // a method that validates user input and checks it 
    private gatherUserInput() : [string,string,number] | void {
        const enteredTitle = this.titelInputElement.value;
        const enteredDescription = this.descriptionlInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable : Validatable = {
            value : enteredTitle ,
            required :true,
        };
        const descriptionValidatable : Validatable = {
            value : enteredDescription ,
            required :true,
            minLength : 5
        };
        const peopleValidatable : Validatable = {
            value : +enteredPeople ,
            required :true,
            min :1,
            max : 5
        };


        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable) 
        ) {
            alert('invalid input please try again ')
            return;
        }
        else {
            return [enteredTitle,enteredDescription,parseFloat(enteredPeople)];
        }
    }
    // a method to clear the form after checking if it is validatable 
    private clearInputs() {
        this.titelInputElement.value = '';
        this.descriptionlInputElement.value = '';
        this.peopleInputElement.value = '';

    }

    private sumbitHandler (event : Event) 
    {
        // the default behavior is to send an http request
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)){
            const [title,desc,people] = userInput;
            projectstate.addProject(title,desc,people);
            this.clearInputs()
        }

    }

    private configure () {
        this.element.addEventListener('submit', this.sumbitHandler.bind(this));
    }
    private attach() {
        // method that insert's an html element 
        this.hostElement.insertAdjacentElement('afterbegin',this.element );
    }
}
const projectinput = new ProjectInput ();
const activeproject = new ProjectList('active');
const finishedproject = new ProjectList('finished');
