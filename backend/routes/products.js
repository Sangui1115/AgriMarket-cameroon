const express = require('express');
const router = express.Router();
const db = require('../db');

// --- TEST ROUTE ---
router.get('/test', (req, res) => res.send("Products route OK"));

// --- AJOUTER PRODUIT ---
router.post('/add', (req, res) => {
    const { nom, prix, quantite, localisation, user_id } = req.body;

    if (!nom || !prix || !quantite || !user_id) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    db.query(
        "INSERT INTO products (nom, prix, quantite, localisation, user_id) VALUES (?, ?, ?, ?, ?)",
        [nom, prix, quantite, localisation || '', user_id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: "Produit ajouté avec succès", productId: result.insertId });
        }
    );
});

// --- LISTE DES PRODUITS ---
router.get('/', (req, res) => {
    db.query(
        "SELECT p.*, u.nom AS agriculteur FROM products p JOIN users u ON p.user_id = u.id ORDER BY p.date_creation DESC",
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(result);
        }
    );
});

// --- SUPPRIMER PRODUIT ---
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Produit supprimé" });
    });
});

// --- MODIFIER PRODUIT ---
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { nom, prix, quantite, localisation } = req.body;

    db.query(
        "UPDATE products SET nom=?, prix=?, quantite=?, localisation=? WHERE id=?",
        [nom, prix, quantite, localisation || '', id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Produit mis à jour" });
        }
    );
});

module.exports = router;



