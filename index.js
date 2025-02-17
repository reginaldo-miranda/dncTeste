const renderTasksProgressData = (tasks) => {
    let tasksProgress;

    /*now = new Date;
    document.write("Hoje é " + now.getDay() + ", " + now.getDate() + " de " + now.getMonth() + " de " + now.getFullYear());
*/

    const tasksProgressDOM = document.getElementById('tasks-progress');
    if (tasksProgressDOM) tasksProgress = tasksProgressDOM;
    else {
        const newTasksProgressDOM = document.createElement('div');
        newTasksProgressDOM.id = 'tasks-progress';
         document.getElementById("todo-footer").appendChild(newTasksProgressDOM);
         tasksProgress = newTasksProgressDOM;
}
        const doneTasks = tasks.filter(({ checked}) => checked).length
        const totalTasks = tasks.length;
        tasksProgress.textContent = `${doneTasks}/${totalTasks} concluidas`
}

const getTasksFromLocalStorage = () => {
    const localTasks = JSON.parse(window.localStorage.getItem('tasks'));
    return localTasks ? localTasks : [];
}

const setTasksInLocalStorage = (tasks) => {
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
}
const removeTask = (taskId) => {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(({id}) => parseInt(id) !== parseInt(taskId));
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)

    document
    .getElementById("todo-list")
    .removeChild(document.getElementById(taskId));
}

const removeDoneTasks = () => {
    const tasks = getTasksFromLocalStorage();
    const tasksToRemove = tasks
    .filter(({checked}) => checked)
    .map(({id}) => id)
    const updatedTasks = tasks.filter(({ checked}) => !checked);
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)

    tasksToRemove.forEach((taskToRemove) => {
        document
        .getElementById("todo-list")
        .removeChild(document.getElementById(taskToRemove));
        
    })

}
const createTaskListItem = (task, checkbox) => {
    const list = document.getElementById('todo-list');
    const toDo = document.createElement('li');

    const editTaskButton = document.createElement("button");
    editTaskButton.textContent = 'Editar';
    editTaskButton.className = 'edit-task-btn';
    editTaskButton.ariaLabel = 'Editar tarefa';
    editTaskButton.onclick = () => handleEditTask(task.id);

    const removeTaskButton = document.createElement("button");
    removeTaskButton.textContent = 'Concluir'; 
    removeTaskButton.className = 'remove-task-btn';
    removeTaskButton.ariaLabel = 'Remover tarefa';
    removeTaskButton.onclick = () => removeTask(task.id);

    toDo.id = task.id;
    toDo.appendChild(checkbox);
    toDo.appendChild(editTaskButton);
    toDo.appendChild(removeTaskButton);
   
    list.appendChild(toDo);

    return toDo;
}

const handleEditTask = (taskId) => {
    const taskElement = document.getElementById(taskId);
    const label = taskElement.querySelector('label');
    const currentText = label.textContent.replace(/ \(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}\)$/, '');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editable-task';
    input.value = currentText;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTaskEdit(taskId, input.value);
        }
    });

    input.addEventListener('blur', () => {
        saveTaskEdit(taskId, input.value);
    });

    label.replaceWith(input);
    input.focus();
}

const saveTaskEdit = (taskId, newDescription) => {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.map(task => {
        if (parseInt(task.id) === parseInt(taskId)) {
            return { ...task, description: newDescription };
        }
        return task;
    });

    setTasksInLocalStorage(updatedTasks);
    renderTasksProgressData(updatedTasks);

    const taskElement = document.getElementById(taskId);
    const input = taskElement.querySelector('input.editable-task');
    const label = document.createElement('label');
    label.textContent = newDescription + ` (${new Date().toLocaleString('pt-BR')})`;
    label.htmlFor = `${taskId}-checkbox`;
    input.replaceWith(label);
}

const onCheckboxClick = (event) => {
  const [id] = event.target.id.split('-');
  const tasks = getTasksFromLocalStorage();
  const label = event.target.nextElementSibling;

  const updatedTasks = tasks.map((task) => {
    return parseInt(task.id) === parseInt(id)
        ? { ...task, checked: event.target.checked}
        : task
    });

  if (event.target.checked) {
    label.classList.add('text-taxado');
  } else {
    label.classList.remove('text-taxado');
  }

  setTasksInLocalStorage(updatedTasks);
  renderTasksProgressData(updatedTasks);
}

const getCheckboxImput = ({id, description, checked, createdAt}) => {
    const checkbox = document.createElement('input');
    const label = document.createElement('label');
    const dateSpan = document.createElement('span');
    const Wrapper = document.createElement('div');
    const checkboxId = `${id}-checkbox`;

    checkbox.type = 'checkbox';
    checkbox.id = checkboxId;
    checkbox.checked = checked || false;
    checkbox.addEventListener('change' , onCheckboxClick)

    dateSpan.className = 'task-date';
    dateSpan.textContent = ` (${createdAt})`;
    label.textContent = description;
    label.appendChild(dateSpan);
    label.htmlFor = checkboxId;
    Wrapper.className = 'checkbox-label-container';

    Wrapper.appendChild(checkbox);
    Wrapper.appendChild(label);

    return Wrapper;
}


const getNewTaskId = () => {
    const tasks = getTasksFromLocalStorage()
    const lastId = tasks[tasks.length - 1]?.id;
    return lastId ? lastId + 1 : 1;
}

const getNewTaskData = (event) => {
    const description = event.target.elements.description.value;
    const id = getNewTaskId();
    const createdAt = new Date().toLocaleString('pt-BR');
    return {description, id, createdAt};
}

const getCreatedTaskInfo = (event) => new Promise((resolve) => {
    setTimeout(() => {
        resolve(getNewTaskData(event))

    },3000)

})

const createTask = async (event) => {
    event.preventDefault();
    document.getElementById('save-task').setAttribute('disabled' , true)
    const newTaskData = await getCreatedTaskInfo(event);


    const checkbox = getCheckboxImput(newTaskData);
    createTaskListItem(newTaskData, checkbox);


    const tasks = getTasksFromLocalStorage();

    const updatedTasks = [
        ...tasks,
        { 
            id: newTaskData.id, 
            description: newTaskData.description, 
            checked: false,
            createdAt: newTaskData.createdAt
        }
    ]
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)

    document.getElementById('description').value = ''
    document.getElementById('save-task').removeAttribute('disabled')
} 

window.onload = function() {
    const form = document.getElementById('create-todo-form');
    form.addEventListener('submit', createTask);
 
    const tasks = getTasksFromLocalStorage();

    tasks.forEach((task) => {
        const checkbox = getCheckboxImput(task);
        createTaskListItem(task, checkbox);
        
        // Aplicar estilo taxado para tarefas já marcadas
        if (task.checked) {
            const checkboxElement = document.getElementById(`${task.id}-checkbox`);
            if (checkboxElement) {
                checkboxElement.nextElementSibling.classList.add('text-taxado');
            }
        }
    })
    renderTasksProgressData(tasks)
}
