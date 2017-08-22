var fs = require('fs');

var data = fs.readFileSync('carmodels.json');
var models = JSON.parse(data);

var data = fs.readFileSync('employees.json');
var employees = JSON.parse(data);

var data = fs.readFileSync('total_sales.json');
var totalSales = JSON.parse(data);

var express = require('express');
var app = express();
var server = app.listen(3000, listening);

var bodyParser = require('body-parser');
app.use(bodyParser.json());

function listening(){
    console.log("listening...");
}

app.use(express.static('website'));

app.get('/carmodels', sendAllModels);

function sendAllModels(request, response){
    response.send(models);
}

app.get('/employees', sendAllEmployees);

function sendAllEmployees(request, response){
    response.send(employees);
}

app.get('/total_sales', sendAllSales);

function sendAllSales(request, response){
    response.send(totalSales);
}

app.post('/carmodels', addModel);

function addModel(request, response) {
    models.push({
        id: 5,
        brand: req.body.brand,
        model: req.body.model,
        price: req.body.price
    })
    ;
    var data = JSON.stringify(models, null, 2);
    fs.writeFile('carmodels.json', data, finished);

    response.send({
        id: 5,
        brand: req.body.brand,
        model: req.body.model,
        price: req.body.price
    });
}