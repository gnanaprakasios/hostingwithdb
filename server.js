const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectTimeout: 10000
});

db.connect(err => {
    if (err) {
        console.error("DB Connection Failed:", err);
    } else {
        console.log("MySQL Connected...");
    }
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});