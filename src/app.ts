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
        this.renderElement()

    }
    private sumbitHandler (event : Event) 
    {
        // the default behavior is to send an http request
        event.preventDefault();
    }

    private configure () {
        this.element.addEventListener('submit', this.sumbitHandler.bind(this));
    }
    private renderElement() {
        // method that insert's an html element 
        this.hostElement.insertAdjacentElement('afterbegin',this.element );
    }
}
const projectinput = new ProjectInput ();
