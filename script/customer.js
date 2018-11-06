class Customer {
  constructor(name, phone, address, balance) {
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.balance = balance;
    this.created = null;
    this.deleted = 0;
    this.id = 0;
  }

  isDebtPresent() {
    return this.balance < 0;
  }
}

class CustomerRepository {
  constructor(eventService) {
    this.eventService = eventService;
    this.settings = {
      collectionName: "customers",
      version: "1.0",
      description: "Customers and their data",
      size: 1024 * 1024 * 4
    };
    this.init();
  }
  init() {
    if (!this.databaseObject) {
      this.databaseObject = openDatabase(
        this.settings.collectionName,
        this.settings.version,
        this.settings.description,
        this.settings.size
      );
      this.databaseObject.transaction(tx => {
        let createTableQuery =
          "CREATE TABLE IF NOT EXISTS customers (" +
          " name TEXT(30)," +
          " phone TEXT(30)," +
          " address TEXT(50)," +
          " balance REAL," +
          " created DATE," +
          " deleted INTEGER" +
          " );";
        tx.executeSql(
          createTableQuery,
          [],
          result => {
            console.log("Database has been created successfully");
          },
          (tx, errors) => {
            console.error(
              `There were errors while creating the database: ${errors}`
            );
          }
        );
      });
    }
  }

  checkConnection() {
    if (!this.databaseObject) {
      throw new Error("Not connected to WebSQL");
    }
  }

  /**
   * Saves a new customer to the database
   * @param {Customer} customer a customer to be saved
   */
  create(customer) {
    let query = "INSERT INTO customers VALUES(?,?,?,?,?,0);";
    let date = new Date();
    let args = [
      customer.name,
      customer.phone,
      customer.address,
      customer.balance,
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    ];
    this.executeQueryDefault(query, args, EventType.CREATED);
  }

  /**
   * Updates the customer by the given id
   * @param {number} id id of the customer to be updated
   * @param {Customer} customer the customer to be updated
   */
  update(id, customer) {
    let query =
      "UPDATE customers SET name=?, phone=?, address=?, balance=?" +
      " WHERE rowid = ?";
    let args = [
      customer.name,
      customer.phone,
      customer.address,
      customer.balance,
      id
    ];
    this.executeQueryDefault(query, args, EventType.UPDATED);
  }

  /**
   * Retrives all customers
   */
  getAll() {
    throw new Error("Method is not implemented");
  }

  /**
   * Retrives a customer by the given id
   * @param {number} id id of the customer to find
   */
  getById(id) {
    let query = "SELECT * FROM customers WHERE rowid = ?";
    let args = [id];
    this.executeQuery(query, args);
  }

  /**
   * Marks a customer as deleted
   * @param {number} id id of the customer to be deleted
   */
  delete(id) {
    throw new Error("Method is not implemented");
  }

  executeQueryDefault(query, args, eventType) {
    this.executeQuery(
      query,
      args,
      (transaction, results) => {
        this.eventService.publishEvent(eventType, {
          success: true,
          data: results
        });
      },
      (tx, errors) => {
        this.eventService.publishEvent(eventType, {
          success: false,
          errors: errors
        });
      }
    );
  }

  /**
   * Casts resultSet object to an array of customers
   * @param {SQLResultSet} resultSet result of the executed query
   */
  getJsonFromResultSet(resultSet) {
    let customers = [];
    for (let i = 0; i < resultSet.rows.length; i++) {
      let customer = new Customer();
      let row = resultSet.rows.item(i);
      customer.id = row["rowid"];
      customer.name = row["name"];
      customer.phone = row["phone"];
      customer.address = row["address"];
      customer.created = row["created"];
      customer.deleted = row["deleted"];
      customer.balance = row["balance"];
      customers.push(customer);
    }
    return customers;
  }

  /**
   * Executes a custom query
   *
   * @param {string} query an SQL query to be executed
   * @param {Array} args query arguments
   * @param successCallback called after successfull execution of query;
   * pattern: (transaction, results) => {...}
   * @param errorCallack called in case of an error;
   * pattern: (transaction, errors) => {...}
   */
  executeQuery(query, args, successCallback, errorCallack) {
    this.checkConnection();
    let successCallbackWrapper = (transaction, result) => {
      console.log("query's been executed successfully");
      console.log(`result: ${result}`);
      return successCallback(transaction, result);
    };
    let errorCallbackWrapper = (transaction, errors) => {
      console.log("error while executing query");
      console.log(`errors: ${errors}`);
      return errorCallack(transaction, errors);
    };
    errorCallbackWrapper();
    console.log(`executing query: ${query}; args: ${args}`);
    this.databaseObject.transaction(tx => {
      tx.executeSql(query, args, successCallbackWrapper, errorCallbackWrapper);
    });
  }
}
