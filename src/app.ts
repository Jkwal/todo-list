type ID = string | number;

interface Todo {
    userId: ID,
    id: ID,
    title: string,
    completed: boolean
}

interface User {
    id: ID,
    name: string,
}

(function () {
    //Global
    const todoList = document.getElementById('todo-list')
    const userSelect = document.getElementById('user-todo')
    const form = document.querySelector('form')
    let todos: Todo[] = [];
    let users: User[] = [];

//Attach Events
    document.addEventListener('DOMContentLoaded', initApp);
    form?.addEventListener('submit', handleSubmit);

//Basic Logic
    function getUserName(userId: ID) {
        const user = users.find(user => user.id === userId)
        return user?.name || '';
    }

    function printTodo({id, userId, title, completed}: Todo) {
        const li = document.createElement('li')
        li.className = 'todo-item'
        li.dataset.id = String(id);
        li.innerHTML = `<span>
                        ${title} <i>by</i> <b>${getUserName(userId)}</b>
                    </span>`;

        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTodoChange);

        const close = document.createElement('span')
        close.innerHTML = '&times';
        close.className = 'close';
        close.addEventListener('click', handleClose)

        li.prepend(status);
        li.append(close);

        todoList?.prepend(li);
    }

    function createUserOption(user: User) {
        if (userSelect) {
            const option = document.createElement('option')
            option.value = String(user.id);
            option.innerText = user.name;

            userSelect.append(option)
        }
    }

    function removeTodo(todoId: ID) {
        if (todoList) {
            todos = todos.filter(todo => todo.id !== todoId);

            const todo = todoList.querySelector(`[data-id="${todoId}"]`);
            if (todo) {
                todo.querySelector('input')?.removeEventListener('change', handleTodoChange);
                todo.querySelector('.close')?.removeEventListener('click', handleClose);

                todo.remove();
            }
        }
    }

    function alertError(error: Error) {
        alert(error.message);
    }

//Event Logic
    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then(values => {
            [todos, users] = values;

            //Отправить в разметку
            todos.forEach(todo => printTodo(todo));
            users.forEach(user => createUserOption(user))
        })
    }

    function handleSubmit(event: Event) {
        event.preventDefault();

        if (form) {
            createTodo({
                userId: Number(form.user.value),
                title: form.todo.value,
                completed: false
            })
        }
    }

    function handleTodoChange(this: HTMLInputElement) {
        const parent = this.parentElement
        if (parent) {
            const todoId = parent.dataset.id;
            const completed = this.checked;

            todoId && toggleTodoComplete(todoId, completed);
        }
    }

    function handleClose(this: HTMLSpanElement) {
        const parent = this.parentElement;
        if (parent) {
            const todoId = parent.dataset.id;
            todoId && deleteTodo(todoId)
        }
    }

// Async logic
    async function getAllTodos(): Promise<Todo[]> {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=15');
            return await response.json();
        } catch (error) {
            if (error instanceof Error)
                alertError(error);

            return [];
        }
    }

    async function getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
            return await response.json();
        } catch (error) {
            if (error instanceof Error)
                alertError(error);

            return [];
        }
    }

    async function createTodo(todo: Omit<Todo, 'id'>) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: {
                    'Content-type': 'application/json',
                },
            });

            const newTodo = await response.json();
            printTodo(newTodo);
        } catch (error) {
            if (error instanceof Error)
                alertError(error);
        }
    }

    async function toggleTodoComplete(todoId: ID, completed: boolean) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: 'PATCH',
                body: JSON.stringify({completed}),
                headers: {
                    'Content-type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Fail to connect with server! Please try later.');
            }
        } catch (error) {
            if (error instanceof Error)
                alertError(error);
        }
    }

    async function deleteTodo(todoId: ID) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                },
            });
            if (response.ok) {
                removeTodo(todoId);
            } else {
                throw new Error('Fail to connect with server! Please try later.');
            }
        } catch (error) {
            if (error instanceof Error)
                alertError(error);
        }
    }
})()

