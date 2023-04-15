import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

const appSettings = {
  databaseURL: `https://shoppinglist-42646-default-rtdb.europe-west1.firebasedatabase.app/`,
};

const app = initializeApp(appSettings);

const inputFieldEl = document.querySelector("#input-field");
const addButtonEl = document.querySelector("#add-button");

addButtonEl.addEventListener("click", () => {
  let inputValue = inputFieldEl.value;
  console.log(inputValue);
  inputFieldEl.value = "";
});
