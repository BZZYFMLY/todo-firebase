import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: `https://shoppinglist-42646-default-rtdb.europe-west1.firebasedatabase.app/`,
};

const dbName = "todos";

const app = initializeApp(appSettings);
const db = getDatabase(app);
const todoListInDb = ref(db, dbName);

const inputFieldEl = document.querySelector("#input-field");
const addButtonEl = document.querySelector("#add-button");
const listEl = document.querySelector("#list");
const editModalEl = document.querySelector("#edit-modal");
const deleteModalEl = document.querySelector("#delete-modal");

const createRecord = (title) => {
  return {
    title,
    isWatched: false,
    isDone: false,
    date: new Date().toISOString(),
  };
};

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

const addToList = (record) => {
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
            text: record.date,
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
                update(elemInDb, {isDone: !record.isDone});
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
            className: "btn btn-danger delete",
            event: {
              type: "click",
              handler: () => {
                deleteModalEl.classList.remove("closed");
                deleteModalEl
                  .querySelector("#delete-button")
                  .addEventListener("click", () => {
                    const elemInDb = ref(db, `${dbName}/${record.id}`);
                    remove(elemInDb);
                    console.log("Deleted element:", record);
                    deleteModalEl.classList.add("closed");
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

const addToDB = (record) => push(todoListInDb, record);
const resetInputField = () => (inputFieldEl.value = "");
const resetList = () => (listEl.innerHTML = "");

onValue(todoListInDb, (snapshot) => {
  resetList();
  if (!snapshot?.val()) return;
  let todoListArray = Object.entries(snapshot.val());
  todoListArray.forEach(([id, todoItem]) => addToList({id, ...todoItem}));
});

addButtonEl.addEventListener("click", () => {
  if (inputFieldEl.value === "") return;
  const inputValue = inputFieldEl.value;
  const record = createRecord(inputValue);
  addToDB(record);
  resetInputField();
});
