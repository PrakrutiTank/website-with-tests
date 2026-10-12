(function () {
  const root = document.querySelector("#task-app");
  if (root) {
    createTaskApp(root);
  }

  function createTaskApp(container) {
    const form = container.querySelector("#task-form");
    const input = container.querySelector("#task-input");
    const list = container.querySelector("#task-list");
    const filter = container.querySelector("#task-filter");
    const count = container.querySelector("#task-count");
    const remainingCount = container.querySelector("#remaining-count");
    const emptyState = container.querySelector("#empty-state");
    const message = container.querySelector("#form-message");
    const clearCompletedButton = container.querySelector("#clear-completed");
    const requiredElements = [
      form,
      input,
      list,
      filter,
      count,
      remainingCount,
      emptyState,
      message,
      clearCompletedButton
    ];

    if (requiredElements.some((element) => !element)) {
      throw new Error("The task app is missing required page elements.");
    }

    let tasks = [];
    let nextId = 1;

    function render() {
      const visibleTasks = tasks.filter((task) => {
        if (filter.value === "active") {
          return !task.completed;
        }
        if (filter.value === "completed") {
          return task.completed;
        }
        return true;
      });

      list.replaceChildren();
      visibleTasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = task.completed ? "task-item is-completed" : "task-item";
        item.dataset.taskId = String(task.id);

        const checkbox = document.createElement("input");
        checkbox.className = "task-checkbox";
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.title} as complete`);

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
        deleteButton.textContent = "×";

        item.append(checkbox, title, deleteButton);
        list.append(item);
      });

      const remaining = tasks.filter((task) => !task.completed).length;
      count.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
      remainingCount.textContent = remaining
        ? `${remaining} left to do`
        : tasks.length
          ? "All done — lovely work"
          : "A fresh start";
      emptyState.hidden = visibleTasks.length > 0;
      emptyState.textContent = tasks.length
        ? "No tasks here. Try another filter."
        : "Nothing on the list just yet. Add a task to get started.";
      clearCompletedButton.disabled = !tasks.some((task) => task.completed);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = input.value.trim();
      if (!title) {
        message.textContent = "Add a few words before saving your task.";
        input.focus();
        return;
      }

      tasks.push({ id: nextId, title, completed: false });
      nextId += 1;
      input.value = "";
      message.textContent = "";
      filter.value = "all";
      render();
      input.focus();
    });

    input.addEventListener("input", () => {
      if (input.value.trim()) {
        message.textContent = "";
      }
    });

    list.addEventListener("change", (event) => {
      if (!event.target.matches(".task-checkbox")) {
        return;
      }
      const item = event.target.closest(".task-item");
      const task = tasks.find((entry) => entry.id === Number(item.dataset.taskId));
      if (task) {
        task.completed = event.target.checked;
        render();
      }
    });

    list.addEventListener("click", (event) => {
      const deleteButton = event.target.closest('[data-action="delete"]');
      if (!deleteButton) {
        return;
      }
      const item = deleteButton.closest(".task-item");
      tasks = tasks.filter((task) => task.id !== Number(item.dataset.taskId));
      render();
    });

    filter.addEventListener("change", render);
    clearCompletedButton.addEventListener("click", () => {
      tasks = tasks.filter((task) => !task.completed);
      render();
    });

    render();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createTaskApp };
  }
})();
