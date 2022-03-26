    import { Component } from "./base-component.js";
    import * as Validation from "../util/validation.js";
    import { projectstate } from "../State/project-state.js";
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

            const titleValidatable: Validation.Validatable = {
                value: enteredTitle,
                required: true,
            };
            const descriptionValidatable: Validation.Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            };
            const peopleValidatable: Validation.Validatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5
            };
            if (
                !Validation.validate(titleValidatable) ||
                !Validation.validate(descriptionValidatable) ||
                !Validation.validate(peopleValidatable)
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