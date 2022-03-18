class ProjectInput {
    // properties and thier types
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLFormElement;
    constructor() {
        // Access to the elements inside the DOM
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        const importedNode = document.importNode(this.templateElement.content,true);
        this.element = importedNode.firstElementChild as HTMLFormElement ;
        this.renderElement()
    }
    private renderElement() {
        // method that insert's an html element 
        this.hostElement.insertAdjacentElement('afterbegin',this.element );
    }
}
const projectinput = new ProjectInput ();