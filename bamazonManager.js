var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazoncustomer"
});

// connect to the mysql server and sql database
connection.connect(function (err, results) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    managerStart();
});

var showTableOnly = function () {
    connection.query(
        "SELECT * from products",
        function (err, results) {
            if (err) throw err;
            console.table(results);
            managerStart();
        })
};

var Exit = function () {
    connection.end();
}

var lowInventory = function () {
    var lowInvArray = [];
    connection.query(
        "SELECT * from products",
        function (err, results) {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: "inv",
                        type: "input",
                        message: "What number would you say is 'low inventory'?"
                    }
                ])
                .then(function (answer) {
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].stock_quantity <= answer.inv) {
                            lowInvArray.push(results[i]);
                        }
                    }
                    console.log("----------LOW INVENTORY----------\n")
                    console.table(lowInvArray);
                    managerStart();
                })
        })
}

var managerStart = function () {
    connection.query(
        "SELECT * from products",
        function (err, results) {
            if (err) throw err;
            //console.table(results);
            inquirer
                .prompt([
                    {
                        name: "wut",
                        type: "list",
                        message: "Sup El Jefe, what would you like to do today?",
                        choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"]
                    }
                ])
                .then(function (answer) {
                    var optionID = answer.wut;
                    switch (optionID) {
                        case "View products for sale":
                            showTableOnly();
                            break;

                        case "View low inventory":
                            lowInventory();
                            break;

                        case "Add to inventory":
                            addInventory(results);
                            break;

                        case "Add new product":
                            addProduct();
                            break;

                        case "Exit":
                            Exit();
                            break;
                    }
                }
                );
        }
    );
}

var addProduct = function(results) {
    
}

var addInventory = function (results) {
    console.log("eric");
    inquirer
        .prompt([
            {
                name: "addInvNumba",
                type: "input",
                message: "Which item ID would you like to add inventory to?"
            },
            {
                name: "addInvHowMany",
                type: "input",
                message: "What quantity would you like to add to inventory?"
            }
        ])
        .then(function (answer) {


            for (var i = 0; i < results.length; i++) {
                if (results[i].id == answer.addInvNumba) {
                    var newStock = parseInt(results[i].stock_quantity) + parseInt(answer.addInvHowMany);
                    connection.query(
                      "UPDATE products SET ? WHERE ?",
                      [
                        {
                          stock_quantity: newStock
                        },
                        {
                          id: answer.addInvNumba
                        }
                      ],
                      function(err, res) {
                          showTableOnly();
                      }
                    );
                }
            }


    
        })
    ;

}

var showAndAsk = function () {
    connection.query(
        "SELECT * from products",
        function (err, results) {
            if (err) throw err;
            console.table(results);
            inquirer
                .prompt([
                    {
                        name: "id",
                        type: "input",
                        message: "What is the ID of the item you'd like to buy?"
                    },
                    {
                        name: "units",
                        type: "input",
                        message: "How many units would you like to buy?"
                    }
                ])
                .then(function (answer) {
                    //console.log("The item you want to buy is " + answer.id);
                    //console.log("The quantity you want to buy is " + answer.units);
                    var productID = answer.id;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].id == productID) {
                            if (results[i].stock_quantity >= answer.units) {
                                var orderCost = answer.units * results[i].price;
                                var query = connection.query(
                                    "UPDATE products SET ? WHERE ?",
                                    [
                                        {
                                            stock_quantity: results[i].stock_quantity - answer.units
                                        },
                                        {
                                            id: productID
                                        }
                                    ],
                                    function (err, res) {
                                        console.log(res.affectedRows + " products updated!\n");
                                        showTableOnly(orderCost);
                                    }
                                );
                            } else {
                                console.log("insufficient quantity");
                                showAndAsk();
                            }
                        }
                    }
                }
                );
        }
    );
}