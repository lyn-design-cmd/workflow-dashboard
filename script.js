let tasks = [];
let editingTaskId = null;

const priorityRank = {
    High: 1,
    Medium: 2,
    Low: 3
};

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const priorityInput = document.getElementById("priorityInput");
    const categoryInput = document.getElementById("categoryInput");
    const dueDateInput = document.getElementById("dueDateInput");

    const text = taskInput.value.trim();
    const priority = priorityInput.value;
    const category = categoryInput.value;
    const dueDate = dueDateInput.value;

    if(text === "") return;

    if(editingTaskId) {
        tasks = tasks.map(task => {
            if(task.id === editingTaskId) {
                return { ...task, text, priority, category, dueDate };
            }
            return task;
        });
        editingTaskId = null;
        document.getElementById("addTaskBtn").textContent = "Add Task";
    } else {
        const task = {
            id: Date.now(),
            text,
            priority,
            category,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
    }

    saveTasks();
    renderTasks();
    resetForm();
}

function resetForm() {
    document.getElementById("taskInput").value = "";
    document.getElementById("priorityInput").value = "Medium";
    document.getElementById("categoryInput").value = "Work";
    document.getElementById("dueDateInput").value = "";
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");
    const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const status = document.getElementById("statusFilter")?.value || "All";
    const priorityValue = document.getElementById("priorityFilter")?.value || "All";
    const sortValue = document.getElementById("sortInput")?.value || "newest";

    taskList.innerHTML = "";

    let visibleTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(search) || (task.category || "").toLowerCase().includes(search);
        const matchesPriority = priorityValue === "All" || task.priority === priorityValue;
        const overdue = isOverdue(task);

        let matchesStatus = true;
        if(status === "Active") matchesStatus = !task.completed;
        if(status === "Completed") matchesStatus = task.completed;
        if(status === "Overdue") matchesStatus = overdue;

        return matchesSearch && matchesPriority && matchesStatus;
    });

    visibleTasks.sort((a, b) => {
        if(sortValue === "oldest") return a.id - b.id;
        if(sortValue === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
        if(sortValue === "dueDate") return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
        return b.id - a.id;
    });

    visibleTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        if(isOverdue(task)) li.classList.add("overdue-item");

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("span");
        title.textContent = task.text;

        if(task.completed) {
            title.classList.add("completed");
        }

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = `priority ${task.priority.toLowerCase()}`;
        priority.textContent = `${task.priority} Priority`;

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = task.category || "Work";

        const dueDate = document.createElement("span");
        dueDate.className = "due-date";
        dueDate.textContent = task.dueDate ? `Due: ${task.dueDate}` : "No due date";

        if(isOverdue(task)) dueDate.classList.add("overdue-text");

        meta.appendChild(priority);
        meta.appendChild(category);
        meta.appendChild(dueDate);

        info.appendChild(title);
        info.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Undo" : "Done";
        completeBtn.className = "complete-btn";

        completeBtn.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.onclick = () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        };

        actions.appendChild(completeBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    emptyState.style.display = visibleTasks.length === 0 ? "block" : "none";
    updateStats();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if(!task) return;

    editingTaskId = id;
    document.getElementById("taskInput").value = task.text;
    document.getElementById("priorityInput").value = task.priority;
    document.getElementById("categoryInput").value = task.category || "Work";
    document.getElementById("dueDateInput").value = task.dueDate || "";
    document.getElementById("addTaskBtn").textContent = "Update Task";
    document.getElementById("taskInput").focus();
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function isOverdue(task) {
    if(!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate + "T00:00:00");
    return due < today;
}

function updateStats() {
    document.getElementById("totalTasks").textContent = tasks.length;

    const completed = tasks.filter(task => task.completed).length;
    const overdue = tasks.filter(task => isOverdue(task)).length;

    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;

    let productivity = 0;

    if(tasks.length > 0) {
        productivity = Math.round((completed / tasks.length) * 100);
    }

    document.getElementById("productivity").textContent = productivity + "%";
    document.getElementById("progressText").textContent = productivity + "%";
    document.getElementById("progressFill").style.width = productivity + "%";
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem("tasks");

    if(saved) {
        tasks = JSON.parse(saved).map(task => ({
            category: "Work",
            dueDate: "",
            createdAt: new Date(task.id || Date.now()).toISOString(),
            ...task
        }));
    }

    renderTasks();
}

function toggleDarkMode() {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    updateThemeButton();
}

function loadTheme() {
    if(localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
    }
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.getElementById("themeBtn");
    if(!themeBtn) return;
    themeBtn.textContent = document.body.classList.contains("light-mode") ? "Dark Mode" : "Light Mode";
}

document.getElementById("taskInput").addEventListener("keydown", event => {
    if(event.key === "Enter") {
        addTask();
    }
});

loadTheme();
loadTasks();
