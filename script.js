const STORAGE_KEY = 'widget-task-manager.tasks';

const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const clearCompletedButton = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const template = document.getElementById('task-item-template');
const helpButton = document.querySelector('.help-btn');

let currentFilter = 'all';

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [
      {
        id: Date.now(),
        text: 'Welcome to your task manager',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: Date.now() + 1,
        text: 'Review your top priorities',
        priority: 'high',
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to parse tasks:', error);
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function updateTaskCount() {
  const activeCount = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} left`;
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();

  taskList.innerHTML = '';

  if (!visibleTasks.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks in this view yet.';
    taskList.appendChild(empty);
    updateTaskCount();
    return;
  }

  visibleTasks.forEach((task) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector('.task-item');
    const checkbox = fragment.querySelector('.task-toggle');
    const textNode = fragment.querySelector('.task-text');
    const priorityBadge = fragment.querySelector('.priority-badge');
    const dateNode = fragment.querySelector('.task-date');
    const deleteButton = fragment.querySelector('.delete-btn');

    textNode.textContent = task.text;
    priorityBadge.textContent = task.priority;
    priorityBadge.classList.add(task.priority);
    dateNode.textContent = formatDate(task.createdAt);

    checkbox.checked = task.completed;
    item.classList.toggle('completed', task.completed);

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      render();
    });

    taskList.appendChild(fragment);
  });

  updateTaskCount();
}

function render() {
  renderTasks();

  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === currentFilter);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveTasks();
  form.reset();
  prioritySelect.value = 'medium';
  taskInput.focus();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

helpButton.addEventListener('click', () => {
  if (typeof window.mw !== 'function') {
    return;
  }

  try {
    window.mw('show');
  } catch (error) {
    console.warn('Document360 widget show command failed:', error);
  }
});

render();
