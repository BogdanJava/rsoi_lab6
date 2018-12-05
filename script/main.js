function createCustomerEventHandler(event) {
  let eventDetails = event.detail;
  if (eventDetails.success) {
    console.log("customer has been created");
    updateTable();
    closeAddModal();
    updateButtons();
    pushNotification(
      "SUCCESS",
      "User created successfully!",
      NotificationType.SUCCESS
    );
  } else {
    console.log("error creating customer");
  }
}

function fieldAddedEventHandler(event) {
  let eventSuccess = event.success;
  if (eventSuccess) {
    console.log("field has been created");
    pushNotification(
      "SUCCESS",
      "New field has been added",
      NotificationType.INFO
    );
  }
}

function deleteCustomerEventHandler(event) {
  let eventDetails = event.detail;
  if (eventDetails.success) {
    console.log("customer has been deleted");
    updateTable();
    updateButtons();
    pushNotification(
      "SUCCESS",
      "User deleted successfully!",
      NotificationType.DANGER
    );
  } else {
    console.log("error deleting customer");
  }
}

function updateCustomerEventHandler(event) {
  let eventDetails = event.detail;
  if (eventDetails.success) {
    console.log("customer has been updated");
    updateTable();
    closeEditModal();
    updateButtons();
    pushNotification(
      "SUCCESS",
      "User updated successfully!",
      NotificationType.INFO
    );
  } else {
    console.log("error updating customer");
  }
}

let eventService = new EventService(
  createCustomerEventHandler,
  deleteCustomerEventHandler,
  updateCustomerEventHandler,
  fieldAddedEventHandler
);
let customerRepository = new CustomerRepository(eventService);
