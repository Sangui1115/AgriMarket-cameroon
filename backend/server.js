const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require('cors');


const app = express();

const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

app.use(cors());
app.use(express.json());

console.log("MAIL_USER =", process.env.MAIL_USER);
console.log("MAIL_PASS existe ?", !!process.env.MAIL_PASS);

app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// SERVIR LE FRONTEND
//app.use(express.static(path.join(__dirname, '../frontend')));


// Servir tout le dossier frontend comme fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));

// Tes routes API
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

const rencontresRoutes = require('./routes/rencontres');
app.use('/api/rencontres', rencontresRoutes);

const transporter = require("./config/mailer");

transporter.verify((err, success) => {
  if (err) {
    console.log("SMTP KO:", err.message);
  } else {
    console.log("SMTP OK: prêt à envoyer des emails");
  }
});


// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});



/*const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send("Backend AgriMarket OK");
});

app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});


/*const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send("Backend AgriMarket OK");
});

app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});*/
