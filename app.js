var count = 3;
// Note Class: Represent a Note
class Note {
    constructor(title, content, color, uuid) {
        this.title = title;
        this.content = content;
        this.color = color;
        this.uuid = uuid ? uuid : this.create_UUID();
    }

    create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
}

// UI Class: Handle all Tasks
class UI {
    static displayNotes() {
        var StoredNotes = Store.getNotes();

        const notes = StoredNotes;
        
        notes.forEach(note => UI.addNoteToList(note));
    }

    static addNoteToList(note) {
        const list = document.querySelector('#notes-section');

        const elem = document.createElement('div');
        
        elem.setAttribute('class', `note ${note.color}Style`);
        elem.setAttribute('data-uuid', note.uuid);
        elem.innerHTML = 
            `<div class="header">
                <div class="title">${note.title}</div>
                <div class="tools">
                    <button class="icon-btn edit"><span class="fas fa-pen"></span></button>
                    <button class="icon-btn delete"><span class="fas fa-times"></span></button>
                </div>
            </div>
            <div class="content">${note.content}</div>`;

        list.appendChild(elem);
    }

    static updateNoteToList(note) {
        let uuid = note.uuid;

        let noteEls = document.querySelectorAll('[data-uuid]');
        let elem;
        noteEls.forEach(el => {
            if(el.dataset.uuid === uuid) {
                elem = el;
            }
        });
        
        elem.setAttribute('class', `note ${note.color}Style`);
        elem.innerHTML = 
            `<div class="header">
                <div class="title">${note.title}</div>
                <div class="tools">
                    <button class="icon-btn edit"><span class="fas fa-pen"></span></button>
                    <button class="icon-btn delete"><span class="fas fa-times"></span></button>
                </div>
            </div>
            <div class="content">${note.content}</div>`;

    }

    static editNote(noteEl) {
        let note = Store.getNoteById(noteEl.dataset.uuid);
        this.setNoteInForm(note);
    }

    static setNoteInForm(note) {
        document.querySelector('#title').value = note.title;
        document.querySelector('#content').value = note.content;
        document.querySelector('#color').value = note.color;
        document.querySelector('#uuid').value = note.uuid;
    }

    static deleteNote(noteEl) {
        noteEl.remove();

        // Remove Note from store
        Store.removeNote(noteEl.dataset.uuid);

        // Show success message
        UI.showAlert("Note Removed", 'success');
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('#new-note-form');
        
        container.prepend(div);
        
        // Vanish in 3 seconds
        setTimeout(() => {
            document.querySelector('.alert').remove();
        }, 3000);
    }

    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#content').value = '';
        document.querySelector('#color').value = '';
        document.querySelector('#uuid').value = '';
    }
}

// Store Class: Handles Storage
class Store {
    static getNotes() {
        let notes;
        if(localStorage.getItem('notes') === null) {
            notes = [];
        } else {
            notes = JSON.parse(localStorage.getItem('notes'));
        }

        return notes;
    }

    static addNote(note) {
        const notes = Store.getNotes();

        notes.push(note);

        localStorage.setItem('notes', JSON.stringify(notes));
    }

    static removeNote(uuid) {
        const notes = Store.getNotes();
        
        notes.forEach((note, index) => {
            if(note.uuid === uuid) {
                notes.splice(index, 1);
            }
        });

        localStorage.setItem('notes', JSON.stringify(notes));
    }
    static updateNote(note) {
        const notes = Store.getNotes();
        
        notes.forEach((noteInstance) => {
            if(noteInstance.uuid === note.uuid) {
                noteInstance.title = note.title;
                noteInstance.content = note.content;
                noteInstance.color = note.color;
            }
        });

        localStorage.setItem('notes', JSON.stringify(notes));
    }

    static getNoteById(uuid) {
        return Store.getNotes().find(note => note.uuid === uuid);
    }
}

// Event: Display the Notes
document.addEventListener('DOMContentLoaded', UI.displayNotes());

// Event: Add a Note
document.querySelector('#new-note-form').addEventListener('submit', (event) => {
    // Prevent actual submit
    event.preventDefault();

    // Get form values
    const title = document.querySelector('#title').value;
    const content = document.querySelector('#content').value;
    const color = document.querySelector('#color').value;
    const uuid = document.querySelector('#uuid').value;


    // Validate
    if(title === '' || content === '' || color === '') {
        UI.showAlert('Please fill in all fields', 'danger');
    } else {
        // Instantiate Note
        const note = new Note(title, content, color, uuid);

        if(uuid) {
            // Update Note to UI
            UI.updateNoteToList(note);

            // Update Note to store
            Store.updateNote(note);

            // Show success message
            UI.showAlert("Note Updated", 'success');

        } else {
            // Add Note to UI
            UI.addNoteToList(note);

            // Add Note to store
            Store.addNote(note);

            // Show success message
            UI.showAlert("Note Added", 'success');
        }

        // Clear fields
        UI.clearFields();
    }


})

// Event: Update or Remove a Note
document.querySelector('#notes-section').addEventListener('click', (e) => {
    let el = e.target;
    let noteEl;

    // Get Note element
    if(el.classList.contains('delete') || el.classList.contains('edit')) {
        noteEl = el.parentElement.parentElement.parentElement;
    } else if(el.classList.contains('fa-times') || el.classList.contains('fa-pen')) {
        noteEl = el.parentElement.parentElement.parentElement.parentElement;
    }

    // Ignore if not clicked on edit or delete
    if(!noteEl) {
        return;
    }

    // Either delete button clicked or edit
    if(el.classList.contains('delete') || el.classList.contains('fa-times')) {
        UI.deleteNote(noteEl);
    } else if(el.classList.contains('edit') || el.classList.contains('fa-pen')) {
        UI.editNote(noteEl);
    }
})
















