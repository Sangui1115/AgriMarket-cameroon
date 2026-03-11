const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// --- TEST ROUTE ---
router.get('/test', (req, res) => res.send("Users route OK"));

// --- INSCRIPTION ---
router.post('/register', async (req, res) => {
    const { nom, email, telephone, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe || !role)
        return res.status(400).json({ message: "Champs obligatoires manquants" });

    // Vérifier si l'utilisateur existe déjà
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.length > 0) return res.status(400).json({ message: "Utilisateur déjà inscrit" });

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        db.query(
            "INSERT INTO users (nom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)",
            [nom, email, telephone || '', hashedPassword, role],
            (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                res.status(201).json({ message: "Inscription réussie", userId: result.insertId });
            }
        );
    });
});


router.delete('/api/users/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    'DELETE FROM users WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Utilisateur supprimé' });
    }
  );
});


// --- CONNEXION ---
router.post('/login', (req, res) => {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe)
        return res.status(400).json({ message: "Champs obligatoires manquants" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.length === 0) return res.status(400).json({ message: "Utilisateur non trouvé" });

        const user = result[0];
        const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isValid) return res.status(400).json({ message: "Mot de passe incorrect" });

        res.json({
            message: "Connexion réussie",
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                telephone: user.telephone,
                role: user.role
            }
        });
    });
});

module.exports = router;








/*const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.get('/test', (req, res) => {
    res.send("Backend OK");
});



// --- INSCRIPTION ---
router.post('/register', async (req, res) => {
    try {
        const { nom, email, telephone, mot_de_passe, role } = req.body;

        if (!nom || !email || !telephone || !mot_de_passe || !role) {
            return res.status(400).send({ message: 'Tous les champs sont requis.' });
        }

        // Vérifier doublons
        const [exist] = await db.promise().query(
            'SELECT * FROM users WHERE email = ? OR telephone = ?',
            [email, telephone]
        );

        if (exist.length > 0) {
            return res.status(400).send({ message: 'Email ou téléphone déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        await db.promise().query(
            'INSERT INTO users (nom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, email, telephone, hashedPassword, role]
        );

        res.send({ message: 'Compte créé avec succès.' });

    } catch (err) {
        console.error('Erreur inscription :', err);
        res.status(500).send({ message: 'Erreur serveur.', error: err });
    }
});


// ROUTE TEST
router.get('/test', (req, res) => {
    res.send("Backend USERS OK");
});

module.exports = router;


// --- CONNEXION ---
router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).send({ message: 'Email et mot de passe requis.' });
        }

        const [results] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (results.length === 0) {
            return res.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        const user = results[0];
        const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!isValid) return res.status(401).send({ message: 'Mot de passe incorrect.' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            'SECRET_KEY',   // change si besoin
            { expiresIn: '1h' }
        );

        res.send({
            message: 'Connexion réussie.',
            token,
            user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error('Erreur connexion :', err);
        res.status(500).send({ message: 'Erreur serveur.', error: err });
    }
});

module.exports = router;*/


