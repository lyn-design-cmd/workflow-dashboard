let tasks = [];

function addTask() {

    const taskInput = document.getElementById("taskInput");
    const priorityInput = document.getElementById("priorityInput");

    const text = taskInput.value.trim();
    const priority = priorityInput.value;

    if(text === "") return;

    const task = {
        id: Date.now(),
        text,
        priority,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
}

function renderTasks() {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const li = document.createElement("li");
        li.className = "task-item";

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("span");
        title.textContent = task.text;

        if(task.completed) {
            title.classList.add("completed");
        }

        const priority = document.createElement("span");
        priority.className = `priority ${task.priority.toLowerCase()}`;
        priority.textContent = `${task.priority} Priority`;

        info.appendChild(title);
        info.appendChild(priority);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = "Done";
        completeBtn.className = "complete-btn";

        completeBtn.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.onclick = () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        };

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(actions);

        taskList.appendChild(li);

    });

    updateStats();
}

function updateStats() {

    document.getElementById("totalTasks").textContent = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    document.getElementById("completedTasks").textContent = completed;

    let productivity = 0;

    if(tasks.length > 0) {
        productivity = Math.round((completed / tasks.length) * 100);
    }

    document.getElementById("productivity").textContent = productivity + "%";
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {

    const saved = localStorage.getItem("tasks");

    if(saved) {
        tasks = JSON.parse(saved);
    }

    renderTasks();
}

function toggleDarkMode() {
    document.body.classList.toggle("light-mode");
}

loadTasks();