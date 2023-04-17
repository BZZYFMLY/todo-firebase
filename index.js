import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your web app's Firebase configuration
const appSettings = {
  databaseURL: `https://todo-1438e-default-rtdb.europe-west1.firebasedatabase.app/`,
};

// the name of the database
const dbName = "todos";

// Initialize Firebase
const app = initializeApp(appSettings);
const db = getDatabase(app);
const todoListInDb = ref(db, dbName);

// Add elements
const inputFieldEl = document.querySelector("#input-field");
const addButtonEl = document.querySelector("#add-button");

// List elements
const listEl = document.querySelector("#list");

// Modals
const deleteModalEl = document.querySelector("#delete-modal");
const editModalEl = document.querySelector("#edit-modal");
const editFieldEl = document.querySelector("#edit-field");

// this is the DTO for the todo item
const createRecord = (title) => {
  return {
    title,
    isDone: false,
    createdAt: new Date().toISOString(),
    doneAt: null,
  };
};

// this method renders HTML elements
const createElem = ({
  tag,
  id,
  className,
  text,
  html,
  data,
  src,
  alt,
  parent,
  event,
  children,
}) => {
  const elem = document.createElement(tag);
  className && className.split(" ").forEach((cn) => elem.classList.add(cn));
  id && (elem.id = id);
  text && (elem.textContent = text);
  if (tag === "img") {
    src && (elem.src = src);
    alt && (elem.alt = alt);
  }
  if (typeof event === "object") {
    elem.addEventListener(event.type, event.handler);
  }
  if (html) elem.innerHTML = html;
  if (typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      elem.dataset[key] = value;
    });
  }
  const newChildren =
    !!children && !Array.isArray(children) ? [children] : children;

  newChildren &&
    newChildren.forEach((child) => elem.appendChild(createElem(child)));

  parent && parent.appendChild(elem);
  return elem;
};

const getElapsedTime = (date) => {
  const startDate = new Date(date);
  const endDate = new Date();

  const elapsedTime = endDate.getTime() - startDate.getTime();

  const days = Math.floor(elapsedTime / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (elapsedTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minutes = Math.floor((elapsedTime % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((elapsedTime % (60 * 1000)) / 1000);

  const formattedElapsedTime = [
    {value: days, name: "day"},
    {value: hours, name: "hour"},
    {value: minutes, name: "minute"},
    {value: seconds, name: "second"},
  ]
    .filter((el) => el.value > 0 || el.name === "second")
    .reduce((acc, el) => {
      if (el.value === 1) {
        return `${acc} ${el.value} ${el.name}`;
      }
      return `${acc} ${el.value} ${el.name}s`;
    }, "");

  return formattedElapsedTime;
};

// handling the editing of the todo item
const handleEdit = (record) => {
  const elemInDb = ref(db, `${dbName}/${record.id}`);
  if (editFieldEl.value !== "") {
    update(elemInDb, {title: editFieldEl.value});
    editModalEl.classList.add("closed");
    editFieldEl.value = "";
    editModalEl.removeEventListener("click", handleEdit);
  }
};

// handling the deletion of the todo item
const handleDelete = (record) => {
  const elemInDb = ref(db, `${dbName}/${record.id}`);
  remove(elemInDb);
  deleteModalEl.classList.add("closed");
  editModalEl.removeEventListener("click", handleDelete);
};

const getTimeText = (record) => {
  let {isDone, createdAt, doneAt} = record;

  const valueCheck = (value) => {
    if (value === "false") return false;
    if (value === "true") return true;
    if (value === "null") return null;
    if (value === "undefined") return undefined;
    return value;
  };

  isDone = valueCheck(isDone);
  createdAt = valueCheck(createdAt);
  doneAt = valueCheck(doneAt);

  if (isDone && doneAt) return `Task done at:<br/>${getElapsedTime(doneAt)}`;
  if (!isDone && createdAt)
    return `Task created at:<br/>${getElapsedTime(createdAt)}`;
};

setInterval(() => {
  document.querySelectorAll(".time").forEach((timeEl) => {
    const {isDone, createdAt, doneAt} = timeEl.dataset;
    timeEl.innerHTML = getTimeText({isDone, createdAt, doneAt});
  });
}, 500);

// this method renders the todo item
const renderTodo = (record) => {
  createElem({
    tag: "li",
    className: "todo-container",
    id: record.id,
    parent: listEl,
    children: [
      {
        tag: "div",
        className: "info-container",
        children: [
          {
            tag: "h2",
            className: record.isDone ? "done" : null,
            text: record.title,
          },
          {
            tag: "p",
            className: "time",
            data: {
              createdAt: record.createdAt,
              doneAt: record.doneAt,
              isDone: record.isDone,
            },
            html: getTimeText(record),
          },
        ],
      },
      {
        tag: "div",
        className: "button-container",
        children: [
          {
            tag: "button",
            className: "btn btn-success check",
            event: {
              type: "click",
              handler: () => {
                const elemInDb = ref(db, `${dbName}/${record.id}`);
                update(elemInDb, {
                  isDone: !record.isDone,
                  doneAt: !record.isDone ? new Date().toISOString() : null,
                });
              },
            },
            children: {
              tag: "img",
              src: "assets/done.png",
              alt: "check",
            },
          },
          {
            tag: "button",
            className: "btn btn-danger edit",
            event: {
              type: "click",
              handler: () => {
                editFieldEl.value = record.title;
                editModalEl.classList.remove("closed");
                editModalEl
                  .querySelector("#save-button")
                  .addEventListener("click", () => {
                    handleEdit(record);
                  });
                editModalEl
                  .querySelector("#cancel-edit-button")
                  .addEventListener("click", () => {
                    editModalEl.classList.add("closed");
                  });
              },
            },
            children: {
              tag: "img",
              src: "assets/edit.png",
              alt: "delete",
            },
          },
          {
            tag: "button",
            className: "btn btn-danger delete",
            event: {
              type: "click",
              handler: () => {
                deleteModalEl.classList.remove("closed");
                deleteModalEl
                  .querySelector("#delete-button")
                  .addEventListener("click", () => {
                    handleDelete(record);
                  });
                deleteModalEl
                  .querySelector("#cancel-button")
                  .addEventListener("click", () => {
                    deleteModalEl.classList.add("closed");
                  });
              },
            },
            children: {
              tag: "img",
              src: "assets/delete.png",
              alt: "delete",
            },
          },
        ],
      },
    ],
  });
};

// adding the todo item to the database
const addToDB = (record) => push(todoListInDb, record);

// reset the input field
const resetInputField = () => (inputFieldEl.value = "");

// reset the list
const resetList = () => (listEl.innerHTML = "");

// this method listens to the database and renders the todo items
onValue(todoListInDb, (snapshot) => {
  resetList();
  if (!snapshot?.val()) return;
  let todoListArray = Object.entries(snapshot.val());
  const sortedTodoListArray = todoListArray.sort((a, b) => {
    const aDate = new Date(a[1].createdAt);
    const bDate = new Date(b[1].createdAt);
    return bDate - aDate;
  });
  sortedTodoListArray.forEach(([id, todoItem]) =>
    renderTodo({id, ...todoItem})
  );
});

// add event listener to the add button
addButtonEl.addEventListener("click", () => {
  if (inputFieldEl.value === "") return;
  const inputValue = inputFieldEl.value;
  const record = createRecord(inputValue);
  addToDB(record);
  resetInputField();
});