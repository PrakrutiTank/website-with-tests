const { createTaskApp } = require("../src/app");

function mountMarkup() {
  document.body.innerHTML = `
    <main id="task-app">
      <form id="task-form">
        <input id="task-input">
        <button type="submit">Add</button>
      </form>
      <p id="form-message"></p>
      <select id="task-filter">
        <option value="all">All</option>
        <option value="active">To do</option>
        <option value="completed">Completed</option>
      </select>
      <span id="task-count"></span>
      <span id="remaining-count"></span>
      <button id="clear-completed" type="button">Clear completed</button>
      <ul id="task-list"></ul>
      <p id="empty-state"></p>
    </main>`;
  return document.querySelector("#task-app");
}

function renderApp() {
  const root = mountMarkup();
  createTaskApp(root);
  return root;
}

function addTask(root, value) {
  const input = root.querySelector("#task-input");
  input.value = value;
  root.querySelector("#task-form").dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
}

describe("Daymark task list", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("starts with an empty state and plural task count", () => {
    const root = renderApp();

    expect(root.querySelector("#task-count").textContent).toBe("0 tasks");
    expect(root.querySelector("#remaining-count").textContent).toBe("A fresh start");
    expect(root.querySelector("#empty-state").hidden).toBe(false);
    expect(root.querySelector("#clear-completed").disabled).toBe(true);
  });

  test("adds a trimmed task and updates the list", () => {
    const root = renderApp();
    addTask(root, "  Pick up groceries  ");

    expect(root.querySelector(".task-title").textContent).toBe("Pick up groceries");
    expect(root.querySelector("#task-count").textContent).toBe("1 task");
    expect(root.querySelector("#remaining-count").textContent).toBe("1 left to do");
    expect(root.querySelector("#task-input").value).toBe("");
    expect(root.querySelector("#empty-state").hidden).toBe(true);
  });

  test("shows a message and does not add an empty task", () => {
    const root = renderApp();
    addTask(root, "   ");

    expect(root.querySelector("#form-message").textContent).toMatch(/Add a few words/);
    expect(root.querySelector("#task-list").children).toHaveLength(0);
  });

  test("clears the empty-task message when the user starts typing", () => {
    const root = renderApp();
    addTask(root, "");
    const input = root.querySelector("#task-input");
    input.value = "A";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(root.querySelector("#form-message").textContent).toBe("");
  });

  test("marks a task complete and updates remaining status", () => {
    const root = renderApp();
    addTask(root, "Read a chapter");
    const checkbox = root.querySelector(".task-checkbox");
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(root.querySelector(".task-item").classList.contains("is-completed")).toBe(true);
    expect(root.querySelector("#remaining-count").textContent).toBe("All done — lovely work");
    expect(root.querySelector("#clear-completed").disabled).toBe(false);
  });

  test("filters active and completed tasks and reports an empty filter", () => {
    const root = renderApp();
    addTask(root, "Write a note");
    addTask(root, "Water the plants");

    const firstCheckbox = root.querySelector(".task-checkbox");
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

    const filter = root.querySelector("#task-filter");
    filter.value = "active";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelectorAll(".task-item")).toHaveLength(1);
    expect(root.querySelector(".task-title").textContent).toBe("Water the plants");

    filter.value = "completed";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelectorAll(".task-item")).toHaveLength(1);
    expect(root.querySelector(".task-title").textContent).toBe("Write a note");

    filter.value = "active";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
    const activeCheckbox = root.querySelector(".task-checkbox");
    activeCheckbox.checked = true;
    activeCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelector("#remaining-count").textContent).toBe("All done — lovely work");

    filter.value = "active";
    filter.dispatchEvent(new Event("change", { bubbles: true }));
    expect(root.querySelector("#empty-state").hidden).toBe(false);
    expect(root.querySelector("#empty-state").textContent).toMatch(/Try another filter/);
  });

  test("deletes a task and restores the initial empty state", () => {
    const root = renderApp();
    addTask(root, "Send a postcard");
    root.querySelector(".task-title").click();
    root.querySelector('[data-action="delete"]').click();

    expect(root.querySelector("#task-count").textContent).toBe("0 tasks");
    expect(root.querySelector("#empty-state").hidden).toBe(false);
  });

  test("clears completed tasks while keeping active tasks", () => {
    const root = renderApp();
    addTask(root, "Completed task");
    addTask(root, "Remaining task");

    const checkbox = root.querySelector(".task-checkbox");
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    root.querySelector("#clear-completed").click();

    expect(root.querySelectorAll(".task-item")).toHaveLength(1);
    expect(root.querySelector(".task-title").textContent).toBe("Remaining task");
    expect(root.querySelector("#task-count").textContent).toBe("1 task");
  });

  test("returns to all tasks after adding while a filter is selected", () => {
    const root = renderApp();
    addTask(root, "First task");
    const filter = root.querySelector("#task-filter");
    filter.value = "completed";
    filter.dispatchEvent(new Event("change", { bubbles: true }));

    addTask(root, "Second task");

    expect(filter.value).toBe("all");
    expect(root.querySelectorAll(".task-item")).toHaveLength(2);
  });

  test("rejects a container missing required page elements", () => {
    expect(() => createTaskApp(document.createElement("main"))).toThrow(
      "The task app is missing required page elements."
    );
  });

  test("ignores unrelated list changes and checkboxes without a matching task", () => {
    const root = renderApp();
    addTask(root, "Keep this task");
    root.querySelector(".task-title").dispatchEvent(new Event("change", { bubbles: true }));

    const unmatchedItem = document.createElement("li");
    unmatchedItem.className = "task-item";
    unmatchedItem.dataset.taskId = "999";
    const unmatchedCheckbox = document.createElement("input");
    unmatchedCheckbox.className = "task-checkbox";
    unmatchedCheckbox.type = "checkbox";
    unmatchedItem.append(unmatchedCheckbox);
    root.querySelector("#task-list").append(unmatchedItem);
    unmatchedCheckbox.checked = true;
    unmatchedCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(root.querySelectorAll(".task-item")).toHaveLength(2);
    expect(root.querySelector("#task-count").textContent).toBe("1 task");
  });

  test("starts automatically when the page contains the app root", () => {
    const root = mountMarkup();
    jest.isolateModules(() => {
      require("../src/app");
    });

    addTask(root, "Start the day");

    expect(root.querySelector(".task-title").textContent).toBe("Start the day");
  });
});
