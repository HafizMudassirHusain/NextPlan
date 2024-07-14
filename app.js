document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.toggle-button');
    const navbarLinks = document.querySelector('.navbar-links');

    toggleButton.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
        toggleButton.classList.toggle('active');
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todo-input');
    const dueDateInput = document.getElementById('due-date-input');
    const priorityInput = document.getElementById('priority-input');
    const categoryInput = document.getElementById('category-input');
    const addButton = document.getElementById('add-btn');
    const todoListAll = document.getElementById('all-tasks');
    const todoListActive = document.getElementById('active-tasks');
    const todoListCompleted = document.getElementById('completed-tasks');
    const filters = document.querySelectorAll('.filters button');
    const sortDateButton = document.getElementById('sort-date');
    const sortPriorityButton = document.getElementById('sort-priority');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const searchInput = document.getElementById('search-input');
    const collapsibleToggles = document.querySelectorAll('.collapsible-toggle');

    // Load tasks from localStorage and check for due soon/overdue tasks
    loadTasks();
    checkNotifications();

    addButton.addEventListener('click', addTodo);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filters.forEach(button => {
        button.addEventListener('click', () => {
            filters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTasks(button.id);
        });
    });

    sortDateButton.addEventListener('click', () => sortTasks('date'));
    sortPriorityButton.addEventListener('click', () => sortTasks('priority'));
    darkModeToggle.addEventListener('click', toggleDarkMode);
    searchInput.addEventListener('input', searchTasks);

    collapsibleToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const taskList = toggle.nextElementSibling;
            taskList.classList.toggle('collapsed');
            toggle.classList.toggle('active');
        });
    });

    function addTodo() {
        const todoText = input.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        const category = categoryInput.value;
        if (todoText !== '') {
            const todoItem = createTodoItem(todoText, dueDate, priority, category);
            todoListAll.appendChild(todoItem);
            saveTasks();
            input.value = '';
            dueDateInput.value = '';
        }
    }

    function createTodoItem(text, dueDate, priority, category) {
        const li = document.createElement('li');
        li.setAttribute('draggable', 'true');
        
        const span = document.createElement('span');
        span.textContent = text;
        li.appendChild(span);

        if (dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.textContent = `Due: ${dueDate}`;
            dueDateSpan.classList.add('due-date');
            li.appendChild(dueDateSpan);
        }

        const prioritySpan = document.createElement('span');
        prioritySpan.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        prioritySpan.classList.add('priority', priority);
        li.appendChild(prioritySpan);

        const categorySpan = document.createElement('span');
        categorySpan.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySpan.classList.add('category', category);
        li.appendChild(categorySpan);
        
        // ====================update icon================
        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        completeButton.classList.add('complete-btn');
        completeButton.addEventListener('click', () => {
            li.classList.toggle('completed');
            saveTasks();
        });
        li.appendChild(completeButton);
        // ===================================================
        
        const editButton = document.createElement('button');
        iconE = document.createElement('i');
        iconE.classList.add('fas', 'fa-edit');
        iconE.setAttribute('aria-hidden', 'true');
        editButton.appendChild(iconE);
        // editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', () => {
         iconE.classList.toggle('skyblue');
         editTask(li, span);
        });
        li.appendChild(editButton);
        // ========================================================

        const removeButton = document.createElement('button');
        // removeButton.textContent = 'Remove';
        iconR = document.createElement('i');
        iconR.classList.add('fas', 'fa-xmark');
        iconR.setAttribute('aria-hidden', 'true');
        removeButton.appendChild(iconR);
        removeButton.classList.add('remove-btn');
        // iconR.classList.add('fas','fa-closed');
        // <i class="fa-solid fa-xmark"></i>
        removeButton.addEventListener('click', () => {
            // iconR.classList.toggle('red');
            todoListAll.removeChild(li);
            updateTaskSections();
            saveTasks();
        });
        li.appendChild(removeButton);

        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', drop);
        li.addEventListener('dragend', dragEnd);

        return li;
    }

    function editTask(li, span) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        
        li.classList.add('editing');
        li.replaceChild(input, span);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit(li, input);
            }
        });

        input.addEventListener('blur', () => {
            saveEdit(li, input);
        });

        input.focus();
    }

    function saveEdit(li, input) {
        const span = document.createElement('span');
        span.textContent = input.value;
        li.replaceChild(span, input);
        li.classList.remove('editing');
        saveTasks();
    }

    function saveTasks() {
        const tasks = [];
        todoListAll.querySelectorAll('li').forEach(li => {
            const task = {
                text: li.querySelector('span').textContent,
                completed: li.classList.contains('completed'),
                dueDate: li.querySelector('.due-date') ? li.querySelector('.due-date').textContent.replace('Due: ', '') : '',
                priority: li.querySelector('.priority').textContent.toLowerCase(),
                category: li.querySelector('.category').textContent.toLowerCase()
            };
            tasks.push(task);
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskSections();
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const todoItem = createTodoItem(task.text, task.dueDate, task.priority, task.category);
            if (task.completed) {
                todoItem.classList.add('completed');
            }
            todoListAll.appendChild(todoItem);
        });
        updateTaskSections();
    }

    function updateTaskSections() {
        todoListActive.innerHTML = '';
        todoListCompleted.innerHTML = '';
        todoListAll.querySelectorAll('li').forEach(task => {
            if (task.classList.contains('completed')) {
                todoListCompleted.appendChild(task.cloneNode(true));
            } else {
                todoListActive.appendChild(task.cloneNode(true));
            }
        });
    }

    function filterTasks(filterId) {
        const tasks = todoListAll.querySelectorAll('li');
        const currentDate = new Date().toISOString().split('T')[0];
        tasks.forEach(task => {
            const dueDate = task.querySelector('.due-date') ? task.querySelector('.due-date').textContent.replace('Due: ', '') : '';
            switch (filterId) {
                case 'all-filter':
                    task.style.display = 'flex';
                    break;
                case 'active-filter':
                    task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
                    break;
                case 'completed-filter':
                    task.style.display = task.classList.contains('completed') ? 'flex' : 'none';
                    break;
                case 'due-soon-filter':
                    const dueSoon = new Date(dueDate) < new Date(currentDate);
                    task.style.display = dueDate && dueSoon ? 'flex' : 'none';
                    break;
                case 'overdue-filter':
                    const overdue = new Date(dueDate) < new Date(currentDate);
                    task.style.display = dueDate && overdue ? 'flex' : 'none';
                    break;
            }
        });
    }

    function sortTasks(criteria) {
        const tasksArray = Array.from(todoListAll.children);
        tasksArray.sort((a, b) => {
            if (criteria === 'date') {
                const dateA = new Date(a.querySelector('.due-date') ? a.querySelector('.due-date').textContent.replace('Due: ', '') : '');
                const dateB = new Date(b.querySelector('.due-date') ? b.querySelector('.due-date').textContent.replace('Due: ', '') : '');
                return dateA - dateB;
            } else if (criteria === 'priority') {
                const priorities = ['low', 'medium', 'high'];
                const priorityA = priorities.indexOf(a.querySelector('.priority').textContent.toLowerCase());
                const priorityB = priorities.indexOf(b.querySelector('.priority').textContent.toLowerCase());
                return priorityA - priorityB;
            }
        });
        todoListAll.innerHTML = '';
        tasksArray.forEach(task => todoListAll.appendChild(task));
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
    }

    function searchTasks() {
        const searchText = searchInput.value.toLowerCase();
        const tasks = todoListAll.querySelectorAll('li');
        tasks.forEach(task => {
            const taskText = task.querySelector('span').textContent.toLowerCase();
            task.style.display = taskText.includes(searchText) ? 'flex' : 'none';
        });
    }

    function checkNotifications() {
        const currentDate = new Date().toISOString().split('T')[0];
        todoListAll.querySelectorAll('li').forEach(task => {
            const dueDate = task.querySelector('.due-date') ? task.querySelector('.due-date').textContent.replace('Due: ', '') : '';
            const dueSoon = new Date(dueDate) < new Date(currentDate);
            const overdue = new Date(dueDate) < new Date(currentDate);
            if (dueDate && dueSoon) {
                // alert(`Task "${task.querySelector('span').textContent}" is due soon.`);
                Swal.fire(`Task "${task.querySelector('span').textContent}" is due soon.`);
            } else if (dueDate && overdue) {
                // alert(`Task "${task.querySelector('span').textContent}" is overdue.`);
                Swal.fire(`Task "${task.querySelector('span').textContent}" is overdue.`);
            }
        });
    }

    // Drag and Drop Functions
    let dragged;

    function dragStart(e) {
        dragged = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    }

    function dragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        this.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function drop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (dragged !== this) {
            dragged.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }
        return false;
    }

    function dragEnd(e) {
        this.classList.remove('dragging', 'drag-over');
        saveTasks();
    }
});
