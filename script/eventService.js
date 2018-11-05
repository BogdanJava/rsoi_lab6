/**
 * Publishes events that control the customers table state
 */
class EventService {
  constructor() {
    this.registerDefaultEvents();
  }
  registerDefaultEvents() {
    // todo implement
    // https://developer.mozilla.org/ru/docs/Web/Guide/Events/Создание_и_вызов_событий
  }

  publishEvent(eventType, eventData) {}
}

/**
 * Type of a table event
 */
class EventType {
  static CREATED = "created";
  static DELETED = "deleted";
  static UPDATED = "updated";
}
