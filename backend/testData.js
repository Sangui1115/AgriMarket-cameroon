const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedData() {
    try {
        // --- 1. Créer un utilisateur ---
        const nom = 'Jean Pierre';
        const email = 'jean@test.com';
        const telephone = '650000000';
        const role = 'agriculteur';
        const mot_de_passe = await bcrypt.hash('123456', 10);

        // Vérifier si l'utilisateur existe déjà
        const [exist] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        let userId;
        if (exist.length === 0) {
            const result = await db.promise().query(
                'INSERT INTO users (nom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
                [nom, email, telephone, mot_de_passe, role]
            );
            userId = result[0].insertId;
            console.log('Utilisateur créé :', nom);
        } else {
            userId = exist[0].id;
            console.log('Utilisateur existant :', nom);
        }

        // --- 2. Ajouter 3 produits ---
        const products = [
            { nom: 'Tomates', prix: 1500, quantite: 20, localisation: 'Yaoundé' },
            { nom: 'Maïs', prix: 1200, quantite: 50, localisation: 'Douala' },
            { nom: 'Piments', prix: 2000, quantite: 15, localisation: 'Bafoussam' }
        ];

        for (const p of products) {
            // Vérifier si le produit existe déjà pour cet utilisateur
            const [existProduct] = await db.promise().query(
                'SELECT * FROM products WHERE nom = ? AND user_id = ?',
                [p.nom, userId]
            );

            if (existProduct.length === 0) {
                await db.promise().query(
                    'INSERT INTO products (user_id, nom, prix, quantite, localisation) VALUES (?, ?, ?, ?, ?)',
                    [userId, p.nom, p.prix, p.quantite, p.localisation]
                );
                console.log('Produit ajouté :', p.nom);
            } else {
                console.log('Produit existant :', p.nom);
            }
        }

        console.log('Données de test insérées avec succès !');
        process.exit(0);

    } catch (err) {
        console.error('Erreur insertion test :', err);
        process.exit(1);
    }
}

seedData();
