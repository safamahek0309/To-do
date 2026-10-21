// ---------- 1. Grab the HTML elements we need ----------
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

// The name ("key") under which we store tasks in LocalStorage
const STORAGE_KEY = "taskflow-tasks";

// ---------- 2. Load saved tasks (or start with an empty list) ----------
// Each task looks like: { id: 123, text: "Buy milk", completed: false }
let tasks = loadTasks();

function loadTasks() {
  const savedText = localStorage.getItem(STORAGE_KEY); // returns text, or null
  if (savedText === null) {
    return [];
  }
  try {
    // LocalStorage only holds text, so we convert it back into an array
    return JSON.parse(savedText);
  } catch (error) {
    return []; // if the saved data is broken, start fresh
  }
}

// ---------- 3. Save tasks ----------
function saveTasks() {
  // Convert the array into text, because LocalStorage only stores text
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- 4. Add, toggle, and delete ----------
function addTask(text) {
  const newTask = {
    id: Date.now(), // current time in milliseconds works as a simple unique id
    text: text,
    completed: false,
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  // Find the task with this id and flip completed: true <-> false
  for (const task of tasks) {
    if (task.id === taskId) {
      task.completed = !task.completed;
    }
  }
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  // Keep every task EXCEPT the one with this id
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

// ---------- 5. Draw the tasks on the page ----------
function renderTasks() {
  // Clear the list, then rebuild it from the tasks array
  taskList.replaceChildren();

  for (const task of tasks) {
    const listItem = document.createElement("li");
    listItem.className = "task-item";
    if (task.completed) {
      listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // SAFE: textContent treats the text as plain text, never as HTML.
    // (innerHTML would let someone sneak in code like <script>.)
    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    listItem.append(checkbox, taskText, deleteButton);
    taskList.appendChild(listItem);
  }

  // Show the friendly message only when there are no tasks
  emptyMessage.hidden = tasks.length > 0;
}

// ---------- 6. React to the form being submitted ----------
taskForm.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  const text = taskInput.value.trim(); // trim removes spaces at both ends
  if (text === "") {
    return; // empty task: do nothing
  }

  addTask(text);
  taskInput.value = "";
  taskInput.focus();
});

// ---------- 7. Show saved tasks when the page first loads ----------
renderTasks();
