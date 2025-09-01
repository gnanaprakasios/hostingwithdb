const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "testdb"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === "GET" && parsedUrl.pathname === "/") {
        fs.readFile("index.html", (err, data) => {
            if (err) return res.end("Error loading form");
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });

    } else if (req.method === "POST" && parsedUrl.pathname === "/adduser") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const { name, email } = qs.parse(body);
            db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err) => {
                if (err) return res.end("Error inserting user");
                res.end(`<p>User added!</p><a href="/">Go Back</a>`);
            });
        });

    } else if (req.method === "GET" && parsedUrl.pathname === "/users") {
        db.query("SELECT * FROM users", (err, results) => {
            if (err) return res.end("Error fetching users");
            let html = "<h2>Users</h2><table border='1'><tr><th>ID</th><th>Name</th><th>Email</th></tr>";
            results.forEach(u => html += `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td></tr>`);
            html += "</table><br><a href='/'>Go Back</a>";
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        });

    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));