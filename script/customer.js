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

  toString() {
    return JSON.stringify(this);
  }

  isDebtPresents() {
    return Number.parseInt(this.balance) < 0;
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
          " id TEXT(16), " +
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
          (tx, error) => {
            console.error(
              `There was an error while creating the database: ${error}`
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
    let query = "INSERT INTO customers VALUES(?,?,?,?,?,?,0);";
    let date = new Date();
    let args = [
      this.guid(),
      customer.name,
      customer.phone,
      customer.address,
      customer.balance,
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    ];
    this.executeQueryDefault(query, args, EventType.CREATED);
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }

  /**
   * Updates the customer by the given id
   * @param {number} id id of the customer to be updated
   * @param {Customer} customer the customer to be updated
   */
  update(id, customer) {
    let query =
      "UPDATE customers SET name=?, phone=?, address=?, balance=?" +
      " WHERE id = ?";
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
   * @param resultCallback callback on result data;
   * pattern: (resultArray) => {...}
   */
  getAll(resultCallback, errorCallback) {
    let query = "SELECT * FROM customers WHERE deleted != 1";
    let args = [];
    this.getQuery(query, args, resultCallback, errorCallback);
  }

  /**
   * Retrives a customer by the given id
   * @param {number} id id of the customer to find
   * @param resultCallback callback on result data;
   * pattern: (customer) => {...}
   */
  getById(id, resultCallback, errorCallack) {
    let query = "SELECT * FROM customers WHERE id = ?";
    let args = [id];
    let resultCallbackWrapper = customers => {
      return resultCallback(customers[0]);
    };
    this.getQuery(query, args, resultCallbackWrapper, errorCallack);
  }

  getQuery(query, args, resultCallback, errorCallack) {
    if (!errorCallack) {
      errorCallack = () => {};
    }
    this.executeQuery(
      query,
      args,
      (transaction, results) => {
        resultCallback(this.getJsonFromResultSet(results));
      },
      (transaction, error) => {
        errorCallack(error.message);
      }
    );
  }

  /**
   * Marks a customer as deleted
   * @param {number} id id of the customer to be deleted
   */
  delete(id) {
    let query = "UPDATE customers SET deleted = 1 WHERE id = ?";
    let args = [id];
    this.executeQueryDefault(query, args, EventType.DELETED);
  }

  deleteMany(ids) {
    let query = "UPDATE customers SET deleted = 1 WHERE id in (REPLACE_ME)";
    query = this.processDeleteManyQuery(query, ids);
    let args = ids;
    this.executeQueryDefault(query, args, EventType.DELETED);
  }

  processDeleteManyQuery(query, ids) {
    let replaceString = "";
    for (let id of ids) {
      replaceString += "?,";
    }
    replaceString = replaceString.substring(0, replaceString.length - 1);
    return query.replace("REPLACE_ME", replaceString);
  }

  /**
   * Drops customers table
   */
  dropAll() {
    let query = "DROP TABLE customers";
    let args = [];
    this.executeQuery(query, args, function() {}, function() {});
  }

  executeQueryDefault(query, args, eventType) {
    this.executeQuery(
      query,
      args,
      (transaction, results) => {
        this.eventService.publishEvent(eventType, {
          detail: {
            success: true,
            data: this.getJsonFromResultSet(results)
          }
        });
      },
      (tx, error) => {
        this.eventService.publishEvent(eventType, {
          detail: {
            success: false,
            error: error.message
          }
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
      customer.id = row["id"];
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
   * pattern: (transaction, error) => {...}
   */
  executeQuery(query, args, successCallback, errorCallack) {
    this.checkConnection();
    let successCallbackWrapper = (transaction, result) => {
      console.log("query's been executed successfully");
      console.log(`result: ${this.getJsonFromResultSet(result)}`);
      return successCallback(transaction, result);
    };
    let errorCallbackWrapper = (transaction, error) => {
      console.log(`error: ${error.message}`);
      return errorCallack(transaction, error);
    };
    console.log(`executing query: ${query}; args: ${args}`);
    this.databaseObject.transaction(tx => {
      tx.executeSql(query, args, successCallbackWrapper, errorCallbackWrapper);
    });
  }
}

function stringifyArray(array) {
  return array.map(el => `'${el}'`).reduce((a, b) => `${a}, ${b}`);
}
