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
    showAndAsk();
});

var showTableOnly = function (orderCost) {
    connection.query(
        "SELECT * from products",
        function (err, results) {
            if (err) throw err;
            console.table(results);
            console.log("Your order total is: " + orderCost);
            connection.end();
        })
};

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