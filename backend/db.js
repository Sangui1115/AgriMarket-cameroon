const mysql = require('mysql2');

// Crée la connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',       // ou l'IP de ton serveur MySQL
    user: 'root',            // ton utilisateur MySQL
    password: '',            // ton mot de passe MySQL
    database: 'agrimarketdb'   // le nom de ta base de données
});

// Test de la connexion
db.connect((err) => {
    if (err) {
        console.error('Erreur connexion MySQL :', err);
    } else {
        console.log('Connexion MySQL OK');
    }
});

module.exports = db;