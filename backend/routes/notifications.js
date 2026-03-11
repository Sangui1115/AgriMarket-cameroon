const express = require("express");
const router = express.Router();
const db = require("../db");

// Lire notifications d’un user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    }
  );
});

// Marquer comme lue
router.put("/read/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Notification lue" });
    }
  );
});

module.exports = router;