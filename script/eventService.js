/**
 * Publishes events that control the customers table state
 */
class EventService {
  constructor(createdCallback, deletedCallback, updatedCallback) {
    this.createdCallback = createdCallback;
    this.deletedCallback = deletedCallback;
    this.updatedCallback = updatedCallback;
    this.registerDefaultEvents();
  }
  registerDefaultEvents() {
    document.addEventListener(EventType.CREATED, event => {
      console.log(`received event: ${event}`);
      this.createdCallback(event);
    });
    document.addEventListener(EventType.DELETED, event => {
      console.log(`received event: ${event}`);
      this.deletedCallback(event);
    });
    document.addEventListener(EventType.UPDATED, event => {
      console.log(`received event: ${event}`);
      this.updatedCallback(event);
    });
  }

  publishEvent(eventType, eventData) {
    console.log(`publishing: ${eventType}, ${eventData}`);
    let event = new CustomEvent(eventType, eventData);
    document.dispatchEvent(event);
  }
}

/**
 * Type of a table event
 */
class EventType {}

EventType.CREATED = "created";
EventType.DELETED = "deleted";
EventType.UPDATED = "updated";
