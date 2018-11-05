class Customer {
  constructor(name, phone, address, balance) {
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.balance = balance;
    this.created = new Date();
    this.deleted = 0;
    this.id = 0;
  }

  isDebtPresent() {
    return this.balance < 0;
  }
}

class CustomerRepository {
  databaseObject = null;
  settings = {
    collectionName: "customers",
    version: "1.0",
    description: "Customers and their data",
    size: 1024 * 1024 * 4
  };
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
          "CREATE TABLE customers (" +
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
    this.executeQueryDefault(query, args);
  }

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
    this.executeQueryDefault(query, args);
  }

  getAll() {
    throw new Error("Method is not implemented");
  }

  getById(id) {
    let query = "SELECT * FROM customers WHERE rowid = ?";
    let args = [id];
    this.executeQuery(query, args);
  }

  delete(id) {
    throw new Error("Method is not implemented");
  }

  executeQueryDefault(query, args) {
    this.executeQuery(query, args, result => {}, (tx, errors) => {});
  }

  executeQuery(query, args, successCallback, errorCallack) {
    this.checkConnection();
    let successCallbackWrapper = result => {
      console.log("query's been executed successfully");
      console.log(`result: ${result}`);
      return successCallback(result);
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
