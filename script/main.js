let handler = event => {
    console.log('success: ', event.success)
    console.log('data: ', event.data)
}

let eventService = new EventService(handler, handler, handler);
let customerRepository = new CustomerRepository(eventService);
