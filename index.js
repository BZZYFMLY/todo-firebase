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
    isWatched: false,
    isDone: false,
    createdAt: new Date().toISOString(),
  };
};

// this method renders HTML elements
const createElem = ({
  tag,
  id,
  className,
  text,
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
  const newChildren =
    !!children && !Array.isArray(children) ? [children] : children;

  newChildren &&
    newChildren.forEach((child) => elem.appendChild(createElem(child)));

  parent && parent.appendChild(elem);
  return elem;
};

// handling the editing of the todo item
const handleEdit = (record) => {
  const elemInDb = ref(db, `${dbName}/${record.id}`);
  if (editFieldEl.value !== "") {
    update(elemInDb, {...record, title: editFieldEl.value});
    console.log("Edited element:", record);
    editModalEl.classList.add("closed");
    editFieldEl.value = "";
    editModalEl.removeEventListener("click", handleEdit);
  }
};

// handling the deletion of the todo item
const handleDelete = (record) => {
  const elemInDb = ref(db, `${dbName}/${record.id}`);
  remove(elemInDb);
  console.log("Deleted element:", record);
  deleteModalEl.classList.add("closed");
  editModalEl.removeEventListener("click", handleDelete);
};

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
            text: record.isDone ? record.createdAt : record.doneAt,
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
                  doneAt: new Date().toISOString(),
                });
                console.log("check", record.id);
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
  todoListArray.forEach(([id, todoItem]) => renderTodo({id, ...todoItem}));
});

// add event listener to the add button
addButtonEl.addEventListener("click", () => {
  if (inputFieldEl.value === "") return;
  const inputValue = inputFieldEl.value;
  const record = createRecord(inputValue);
  addToDB(record);
  resetInputField();
});