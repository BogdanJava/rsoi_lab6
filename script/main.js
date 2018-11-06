let handler = event => {
  let eventDetails = event.detail;
  console.log("success: ", eventDetails.success);
  console.log("data: ", eventDetails.data);
};

let eventService = new EventService(handler, handler, handler);
let customerRepository = new CustomerRepository(eventService);

customerRepository.getAll(
  customerArray => {
    customerArray.forEach(customer => {
      console.log(customer.toString());
    });
  },
  errors => {}
);

customerRepository.getById(
  "790f40b2-1729-cbf0-0256-d4de84bed6ed",
  results => {
    console.log(results[0].toString());
  },
  errors => {}
);
