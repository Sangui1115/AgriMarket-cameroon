const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * Dashboard producteur
 * GET /api/dashboard/producer/:userId
 * Retourne:
 * - nb_produits
 * - rencontres_total, en_attente, acceptees, refusees
 * - 5 dernières rencontres
 */
router.get("/producer/:userId", (req, res) => {
  const { userId } = req.params;

  // 1) Compter produits
  const qProducts = "SELECT COUNT(*) AS nb_produits FROM products WHERE user_id = ?";

  // 2) Stats rencontres liées aux produits du producteur
  const qRencontres = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN r.statut = 'En attente' THEN 1 ELSE 0 END) AS en_attente,
      SUM(CASE WHEN r.statut = 'Acceptée' THEN 1 ELSE 0 END) AS acceptees,
      SUM(CASE WHEN r.statut = 'Refusée' THEN 1 ELSE 0 END) AS refusees
    FROM rencontres r
    JOIN products p ON r.product_id = p.id
    WHERE p.user_id = ?
  `;

  // 3) Dernières rencontres
  const qRecent = `
    SELECT r.id, r.client_nom, r.date_rencontre, r.statut, p.nom AS produit
    FROM rencontres r
    JOIN products p ON r.product_id = p.id
    WHERE p.user_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
  `;

  db.query(qProducts, [userId], (e1, r1) => {
    if (e1) return res.status(500).json({ message: e1.message });

    db.query(qRencontres, [userId], (e2, r2) => {
      if (e2) return res.status(500).json({ message: e2.message });

      db.query(qRecent, [userId], (e3, r3) => {
        if (e3) return res.status(500).json({ message: e3.message });

        res.json({
          nb_produits: r1?.[0]?.nb_produits ?? 0,
          rencontres: r2?.[0] ?? { total: 0, en_attente: 0, acceptees: 0, refusees: 0 },
          recent_rencontres: r3 ?? []
        });
      });
    });
  });
});

module.exports = router;