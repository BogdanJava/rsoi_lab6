/**
 * Publishes events that control the customers table state
 */
class EventService {
  constructor(
    createdCallback,
    deletedCallback,
    updatedCallback,
    fieldAddedCallback
  ) {
    this.createdCallback = createdCallback;
    this.deletedCallback = deletedCallback;
    this.updatedCallback = updatedCallback;
    this.fieldAddedCallback = fieldAddedCallback;
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
    document.addEventListener(EventType.FIELD_CREATED, event => {
      this.fieldAddedCallback(event);
    });
  }

  /**
   * Publishes event into EventService
   * @param {string} eventType type of a publishing event
   * @param {object} eventData a companion object
   */
  publishEvent(eventType, eventData) {
    console.log(`publishing: ${eventType}, ${JSON.stringify(eventData)}`);
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
EventType.FIELD_CREATED = "field_created";
