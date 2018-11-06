let customersTableBody = document.getElementById(
  "customers_table__table__body"
);

let addButton = document.getElementById("addButton");
let editButton = document.getElementById("editButton");
let deleteButton = document.getElementById("deleteButton");

let addCustomerModal = document.getElementById("addCustomerModal");
let closeAddCustomerModalButton = addCustomerModal.getElementsByClassName(
  "close"
)[0];

addButton.onclick = () => {
  addCustomerModal.style.display = "block";
};

closeAddCustomerModalButton.onclick = () => {
  addCustomerModal.style.display = "none";
};

window.onclick = event => {
  if (event.target == addCustomerModal) {
    addCustomerModal.style.display = "none";
  }
};
