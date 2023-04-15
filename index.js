import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: `https://shoppinglist-42646-default-rtdb.europe-west1.firebasedatabase.app/`,
};

const app = initializeApp(appSettings);
const db = getDatabase(app);
const shopppingListInDb = ref(db, "movies");

const inputFieldEl = document.querySelector("#input-field");
const addButtonEl = document.querySelector("#add-button");
const listEl = document.querySelector("#list");

addButtonEl.addEventListener("click", () => {
  if (inputFieldEl.value === "") {
    return;
  }
  const inputValue = inputFieldEl.value;
  const record = {
    title: inputValue,
    isWatched: false,
    isDone: false,
    date: new Date().toISOString(),
  };
  push(shopppingListInDb, record);
  inputFieldEl.value = "";
  console.log("record added:", record);
  listEl.innerHTML += `<li>${inputValue}</li>`;
});
