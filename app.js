let http = require('http');
let fs = require('fs');
let pgp = require("pg-promise")(/*options*/);
let db = pgp("postgres://postgres:mysecretpassword@localhost:5432/postgres");

db.one("CREATE TABLE if not exists users (user_id INT, user_name VARCHAR(50));")
    .then(function (data) {
        console.log("DATA:", data.value);
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function (request, response) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Request-Method', '*');
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        response.setHeader('Access-Control-Allow-Headers', '*');

        if (request.method === 'OPTIONS') {
            response.writeHead(200);
            response.end();
            return;
        }

        if (request.url === "/") {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
        }
        if (request.url.startsWith('/users/')) {
            let username = request.url.substring(request.url.lastIndexOf('/') + 1);

            db.one('SELECT user_id as id from users where user_name = $1;', username)
                .then(function (data) {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write("Пользователь " + username + " найден! ID: " + data.id);
                    response.end();
                })
                .catch(function (error) {
                    response.writeHead(404, {"Content-Type": "text/html"});
                    response.write("Пользователь " + username + " не найден!");
                    response.end();
                });
        }
    }).listen(8000);
});