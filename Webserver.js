var fs = require('fs');


var data = fs.readFileSync('carshop.json', "utf8");
var JSONobject = JSON.parse(data);

var express = require('express');
var app = express();
var server = app.listen(3000, listening);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("carshop");

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS employees");
db.run("CREATE TABLE employees(id INTEGER, name TEXT)");

db.run("DROP TABLE IF EXISTS carmodels");
db.run("CREATE TABLE carmodels(id INTEGER, brand TEXT, model TEXT, price INTEGER)");

db.run("DROP TABLE IF EXISTS total_sales");
db.run("CREATE TABLE total_sales(id INTEGER, employee_id INTEGER, carmodel_id INTEGER)");


var stmt = db.prepare("INSERT INTO employees(id, name) VALUES (?,?)");
for (i = 0; i < JSONobject.carshop.employees.length; i++) {
    var obj = JSONobject.carshop.employees[i];
    stmt.run(obj.id, obj.name);
}
stmt.finalize();

});

db.serialize(() => {
    var stmt2 = db.prepare("INSERT INTO carmodels(id, brand, model, price) VALUES (?,?,?,?)");
for (i = 0; i < JSONobject.carshop.carmodels.length; i++) {
    var obj = JSONobject.carshop.carmodels[i];
  //  console.log(obj.id, obj.brand, obj.model, obj.price)
    stmt2.run(obj.id, obj.brand, obj.model, obj.price);
}
stmt2.finalize();
});


db.serialize(() => {
    var stmt3 = db.prepare("INSERT INTO total_sales(id, employee_id, carmodel_id) VALUES (?,?,?)");
for (i = 0; i < JSONobject.carshop.sales.length; i++) {
    var obj = JSONobject.carshop.sales[i];
  //  console.log(obj.id, obj.employee_id, obj.carmodel_id);
    stmt3.run(obj.id, obj.employee_id, obj.carmodel_id);
}
stmt3.finalize();

});







function listening(){
    console.log("listening...");
}

app.use(express.static('website'));

app.get('/carmodels', sendAllModels);

function sendAllModels(request, response) {
    var array = [];
    db.serialize(() => {

        db.each("SELECT rowid AS id, brand, model, price FROM carmodels", function (err, row) {
        var object = {"id": row.id, "brand": row.brand, "model": row.model, "price": row.price}
        array.push(object);
    }, function(err, NumberOfRows){
        console.log(array);
        response.send(JSON.stringify(array));
    });
});

}


app.get('/employees', sendAllEmployees);

function sendAllEmployees(request, response){
    var array = [];
    var prices = [];
    var sales = [];
    var employees = [];
    var totalSale = [];

    db.serialize(() => {

        db.each("SELECT rowid AS id, price FROM carmodels", function (err,row){
        var priceObject = {"id": row.id, "price" : row.price}
        prices.push(priceObject);
    });

    db.each("SELECT rowid AS id, employee_id, carmodel_id FROM total_sales", function (err,row){
        var saleObject = {"id": row.id, "employee_id" : row.employee_id, "carmodel_id" : row.carmodel_id}
        sales.push(saleObject);
    });

        db.each("SELECT rowid AS id, name FROM employees", function (err, row) {
        var employeeObject = {"id": row.id, "name" : row.name}
        employees.push(employeeObject);
    },
            function(err, NumberOfRows) {
            for (var obj in sales) {
                console.log(sales[obj].employee_id)
                totalSale[sales[obj].employee_id] += prices[sales[obj].carmodel_id - 1].price;
                }
                console.log(totalSale[2]);
        for (var employee in employees) {
            var finalObject = {"id": employee.id, "name": employee.name, "sales": totalSale[employee.id]}
            array.push(finalObject);
        }
            console.log(array);
        response.send(JSON.stringify(array));
    });
});
}

app.get('/total_sales', sendAllSales);

function sendAllSales(request, response){
    var array = [];
    db.serialize(() => {

        db.each("SELECT rowid AS id, employee_id, carmodel_id FROM total_sales", function (err, row) {
        var object = {"id": row.id, "employee_id" : row.employee_id, "carmodel_id" : row.carmodel_id}
        array.push(object);
    }, function(err, NumberOfRows){
        console.log(array);
        response.send(JSON.stringify(array));
    });
});
}

app.post('/carmodels', addModel);

function addModel(req, response) {
    var object = {"id" : 5, "brand" : req.body.brand, "model" : req.body.model, "price" : req.body.price}
    db.serialize(() => {
        var stmt2 = db.prepare("INSERT INTO carmodels(id, brand, model, price) VALUES (?,?,?,?)");
        stmt2.run(object.id, object.brand, object.model, object.price);

    stmt2.finalize();
    response.send(JSON.stringify(object));
});


}
