const express = require("express");
const router = express.Router();
const db = require("../db");
const transporter = require("../config/mailer");

// ✅ Créer une demande de rencontre
router.post("/add", (req, res) => {
  const { product_id, client_nom, date_rencontre } = req.body;

  if (!product_id || !client_nom || !date_rencontre) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  db.query(
    "INSERT INTO rencontres (product_id, client_nom, date_rencontre) VALUES (?, ?, ?)",
    [product_id, client_nom, date_rencontre],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      // 🔎 récupérer email producteur
      db.query(
        `SELECT u.email, u.nom AS producteur_nom, p.nom AS produit
         FROM products p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [product_id],
        (err2, rows) => {
          if (err2 || !rows.length) {
            return res.status(201).json({ message: "Demande envoyée (producteur introuvable)" });
          }

          const { email, producteur_nom, produit } = rows[0];

          // ✅ si pas d'email, on ne bloque pas la demande
          if (!email) {
            return res.status(201).json({ message: "Demande envoyée (email du producteur manquant)" });
          }

          const mailOptions = {
            from: `AgriMarket Cameroon <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Nouvelle demande de rencontre",
            html: `
              <h3>Bonjour ${producteur_nom || "Producteur"},</h3>
              <p>Un client (<b>${client_nom}</b>) souhaite une rencontre pour :</p>
              <p><b>${produit || "Produit"}</b></p>
              <p>Date demandée : ${date_rencontre}</p>
              <br>
              <p>Connectez-vous sur AgriMarket Cameroon pour répondre à la demande.</p>
            `
          };

          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.log("Erreur email:", error.message);
              return res.status(201).json({ message: "Demande envoyée (email échoué)" });
            }

            res.status(201).json({ message: "Demande envoyée + email envoyé" });
          });
        }
      );
    }
  );
});
// ✅ Voir les demandes du producteur (par user_id)
router.get("/producer/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT r.*, p.nom AS produit, p.user_id AS producer_id
    FROM rencontres r
    JOIN products p ON r.product_id = p.id
    WHERE p.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});


// ✅ Accepter / Refuser une demande (statut)
router.put("/update-status/:id", (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  db.query(
    "UPDATE rencontres SET statut = ? WHERE id = ?",
    [statut, id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });

      // 📧 ICI ON AJOUTE L’ENVOI D’EMAIL
      db.query(
        `SELECT u.email, u.nom AS producteur_nom,
                p.nom AS produit, r.client_nom
         FROM rencontres r
         JOIN products p ON r.product_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE r.id = ?`,
        [id],
        (err2, rows) => {

          if (err2 || !rows.length) {
            return res.json({ message: "Statut mis à jour (sans email)" });
          }

          const { email, producteur_nom, produit, client_nom } = rows[0];

          const mailOptions = {
            from: "AgriMarket Cameroon <TON_EMAIL@gmail.com>",
            to: email,
            subject: "Statut de la rencontre mis à jour",
            html: `
              <h3>Bonjour ${producteur_nom},</h3>
              <p>La demande de <b>${client_nom}</b> pour :</p>
              <p><b>${produit}</b></p>
              <p>a été mise à jour :</p>
              <h2>${statut}</h2>
              <p>AgriMarket Cameroon</p>
            `
          };

          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.log("Erreur email:", error);
              return res.json({ message: "Statut mis à jour (email échoué)" });
            }

            res.json({ message: "Statut mis à jour + email envoyé" });
          });
        }
      );
    }
  );
});

module.exports = router;