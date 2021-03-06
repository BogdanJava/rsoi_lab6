let customersTableBody = document.getElementById("customersTableBody");

let addButton = document.getElementById("addButton");
let editButton = document.getElementById("editButton");
let deleteButton = document.getElementById("deleteButton");

let addCustomerModal = document.getElementById("addCustomerModal");
let editCustomerModal = document.getElementById("editCustomerModal");
let closeAddCustomerModalButton = addCustomerModal.getElementsByClassName(
  "close"
)[0];
let closeEditCustomerModalButton = editCustomerModal.getElementsByClassName(
  "close"
)[0];

let editCustomerButton = document.getElementById("editCustomerButton");
let phoneInputEdit = document.getElementById("phoneInputEdit");
let addressInputEdit = document.getElementById("addressInputEdit");
let balanceInputEdit = document.getElementById("balanceInputEdit");
let nameInputEdit = document.getElementById("nameInputEdit");
let idSpan = document.getElementById("idSpan");

let saveCustomerButton = document.getElementById("saveCustomerButton");
let phoneInputAdd = document.getElementById("phoneInputAdd");
let addressInputAdd = document.getElementById("addressInputAdd");
let balanceInputAdd = document.getElementById("balanceInputAdd");
let nameInputAdd = document.getElementById("nameInputAdd");

editCustomerButton.onclick = () => {
  customerRepository.update(
    editedCustomer.id,
    getCustomerFromEditModal(editedCustomer)
  );
};

deleteButton.onclick = () => {
  let checkedCheckboxes = getCheckedCheckboxes();
  let ids = [];
  for (checked of checkedCheckboxes) {
    ids.push(getCustomerIdFromCheckbox(checked));
  }
  customerRepository.deleteMany(ids);
};

function getCustomerIdFromCheckbox(checkbox) {
  return checkbox.id.substring(3);
}

function getCheckedCheckboxes() {
  let checkboxes = getCheckboxes();
  let checked = [];
  for (checkbox of checkboxes) {
    if (checkbox.checked) checked.push(checkbox);
  }
  if (checked.length == 0) {
    throw new Error("No checked checkboxes");
  } else {
    return checked;
  }
}

saveCustomerButton.onclick = () => {
  let customer = new Customer(
    nameInputAdd.value,
    phoneInputAdd.value,
    addressInputAdd.value,
    Number.parseInt(balanceInputAdd.value)
  );
  customerRepository.create(customer);
};

addButton.onclick = () => {
  clearAddModal();
  addCustomerModal.style.display = "block";
};

let editedCustomer = null;

editButton.onclick = () => {
  let checkbox = getCheckedCheckboxes()[0];
  let updatedId = getCustomerIdFromCheckbox(checkbox);
  customerRepository.getById(updatedId, customer => {
    setCustomerIntoEditModal(customer);
    editedCustomer = customer;
    editCustomerModal.style.display = "block";
  });
};

function getCustomerFromEditModal(editedCustomer) {
  editedCustomer.name = nameInputEdit.value;
  editedCustomer.phone = phoneInputEdit.value;
  editedCustomer.address = addressInputEdit.value;
  editedCustomer.balance = balanceInputEdit.value;
  return editedCustomer;
}

function setCustomerIntoEditModal(customer) {
  idSpan.innerText = customer.id;
  nameInputEdit.value = customer.name;
  phoneInputEdit.value = customer.phone;
  addressInputEdit.value = customer.address;
  balanceInputEdit.value = customer.balance;
}

closeAddCustomerModalButton.onclick = () => {
  closeAddModal();
};

closeEditCustomerModalButton.onclick = () => {
  closeEditModal();
};

function clearAddModal() {
  nameInputAdd.value = "";
  phoneInputAdd.value = "";
  addressInputAdd.value = "";
  balanceInputAdd.value = "";
}

function closeAddModal() {
  addCustomerModal.style.display = "none";
}

function closeEditModal() {
  editCustomerModal.style.display = "none";
}

function insertNewRow(rowString, customerId) {
  customersTableBody.insertAdjacentHTML("beforeend", rowString);
  document.getElementById(customerId).onclick = () => {
    fillDetailedInfo(customerId);
  };
}

let infoIdBlock = document.getElementById("infoId");
let infoPhoneBlock = document.getElementById("infoPhone");
let infoBalanceBlock = document.getElementById("infoBalance");
let infoAddressBlock = document.getElementById("infoAddress");
let infoCreatedBlock = document.getElementById("infoCreated");
let infoNameBlock = document.getElementById("infoName");

function fillDetailedInfo(customerId) {
  customerRepository.getById(customerId, customer => {
    infoIdBlock.innerText = customer.id;
    infoPhoneBlock.innerText = customer.phone;
    infoBalanceBlock.innerText = customer.balance;
    infoAddressBlock.innerText = customer.address;
    infoCreatedBlock.innerText = customer.created;
    infoNameBlock.innerText = customer.name;
  });
}

window.onload = () => {
  updateTable();
  updateButtons();
};

function getCheckboxes() {
  return document.getElementsByClassName("customers-table__table_checkbox");
}

function setCheckboxListeners() {
  let checkboxes = getCheckboxes();
  for (checkbox of checkboxes) {
    setCheckboxListener(checkbox);
  }
}

function setCheckboxListener(checkbox) {
  checkbox.onchange = () => {
    updateButtons();
  };
}

function updateTable() {
  customersTableBody.innerHTML = "";
  customerRepository.getAll(customers => {
    customers.forEach(customer => {
      let rowString = `
      <tr id="${customer.id}" class="${
        customer.isDebtPresents() ? "has-debt" : ""
      }">
        <td>
          <input type="checkbox" class="customers-table__table_checkbox"
          id="cb_${customer.id}">
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.isDebtPresents() ? "Yes" : "No"}</td>
      </tr>
      `;
      insertNewRow(rowString, customer.id);
      setCheckboxListener(document.getElementById(`cb_${customer.id}`));
    });
    if (customers && customers.length > 0) {
      fillDetailedInfo(customers[0].id);
    }
    setCheckboxListeners();
    updateButtons();
  });
}

window.onclick = event => {
  if (event.target == addCustomerModal) {
    addCustomerModal.style.display = "none";
  }
  if (event.target == editCustomerModal) {
    editCustomerModal.style.display = "none";
  }
};

let keyNameDivs = document.getElementsByClassName("info__attribute_key");
for (div of keyNameDivs) {
  div.innerText = div.innerText + ":";
}

function updateButtons() {
  let checkboxes = document.getElementsByClassName(
    "customers-table__table_checkbox"
  );
  let noCheckedCheckboxes = true;
  let checkedCount = 0;
  for (checkbox of checkboxes) {
    if (checkbox.checked) {
      noCheckedCheckboxes = false;
      checkedCount++;
    }
  }
  if (noCheckedCheckboxes) {
    editButton.disabled = true;
    deleteButton.disabled = true;
  } else {
    if (checkedCount == 1) {
      editButton.disabled = false;
    } else {
      editButton.disabled = true;
    }
    deleteButton.disabled = false;
  }
}
