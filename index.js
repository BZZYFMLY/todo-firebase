import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
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

const createRecord = (title) => {
  return {
    title,
    isWatched: false,
    isDone: false,
    date: new Date().toISOString(),
  };
};

const addToList = (record) => {
  push(shopppingListInDb, record);
  listEl.innerHTML += `<li>${record.title}</li>`;
  console.log("record added:", record);
};

const resetInputField = () => {
  inputFieldEl.value = "";
};

onValue(shopppingListInDb, function (snapshot) {
  let shopppingListArray = Object.values(snapshot.val());

  // Challenge: Write a for loop where you console log each book.
  for (let i = 0; i < shopppingListArray.length; i++) {
    let shoppingItem = shopppingListArray[i];

    console.log(shoppingItem);
  }
});

addButtonEl.addEventListener("click", () => {
  if (inputFieldEl.value === "") return;
  const inputValue = inputFieldEl.value;
  const record = createRecord(inputValue);
  addToList(record);
  resetInputField();
});
