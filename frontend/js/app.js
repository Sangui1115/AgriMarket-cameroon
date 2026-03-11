console.log('Frontend AgriMarket Cameroon chargé.');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nom: document.getElementById('nom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        mot_de_passe: document.getElementById('mot_de_passe').value,
        role: document.getElementById('role').value
    };

    const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    messageDiv.innerText = result.message;
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('loginEmail').value,
        mot_de_passe: document.getElementById('loginPassword').value
    };

    const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    messageDiv.innerText = result.message;

    if (res.ok) {
        localStorage.setItem('token', result.token);
        console.log('Utilisateur connecté :', result.user);
    }
});




// URL du backend
const BASE_URL = 'http://localhost:3000/api/users';

// ----- INSCRIPTION -----
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nom: document.getElementById('nom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        mot_de_passe: document.getElementById('mot_de_passe').value,
        role: document.getElementById('role').value
    };

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        messageDiv.style.color = res.ok ? 'green' : 'red';
        messageDiv.innerText = result.message;

        // Réinitialiser le formulaire si succès
        if (res.ok) registerForm.reset();

    } catch (err) {
        console.log(err);
        messageDiv.style.color = 'red';
        messageDiv.innerText = 'Erreur serveur.';
    }
});

// ----- CONNEXION -----
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('loginEmail').value,
        mot_de_passe: document.getElementById('loginPassword').value
    };

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        messageDiv.style.color = res.ok ? 'green' : 'red';
        messageDiv.innerText = result.message;

        if (res.ok) {
            // Stocker le token pour les futures requêtes sécurisées
            localStorage.setItem('token', result.token);
            console.log('Utilisateur connecté :', result.user);
            loginForm.reset();
        }

    } catch (err) {
        console.log(err);
        messageDiv.style.color = 'red';
        messageDiv.innerText = 'Erreur serveur.';
    }
});
  
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

// ----- AJOUTER PRODUIT -----
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Connectez-vous pour publier un produit.');
        return;
    }

    const data = {
        user_id: JSON.parse(atob(token.split('.')[1])).id, // récupère id depuis JWT
        nom: document.getElementById('productNom').value,
        prix: parseFloat(document.getElementById('productPrix').value),
        quantite: parseInt(document.getElementById('productQuantite').value),
        localisation: document.getElementById('productLocalisation').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/products/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        productForm.reset();
        loadProducts();
    } catch (err) {
        console.error(err);
        alert('Erreur serveur.');
    }
});

// ----- CHARGER LES PRODUITS -----
async function loadProducts() {
    try {
        const res = await fetch('http://localhost:3000/api/products/list');
        const products = await res.json();

        productList.innerHTML = '';

        products.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="margin-bottom:10px; padding:5px; border:1px solid #ccc;">
                    <strong>${p.nom}</strong> - ${p.prix} FCFA - ${p.quantite} unités - ${p.localisation} (Agriculteur: ${p.agriculteur})
                    <button onclick="showEditForm(${p.id}, this)">Modifier</button>
                    <button onclick="deleteProduct(${p.id})">Supprimer</button>
                    <form style="display:none; margin-top:5px;" onsubmit="updateProduct(event, ${p.id}, this)">
                        <input type="text" name="nom" value="${p.nom}" required>
                        <input type="number" step="0.01" name="prix" value="${p.prix}" required>
                        <input type="number" name="quantite" value="${p.quantite}" required>
                        <input type="text" name="localisation" value="${p.localisation}">
                        <button type="submit">Enregistrer</button>
                        <button type="button" onclick="hideEditForm(this.form)">Annuler</button>
                    </form>
                </div>
            `;
            productList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}
function showEditForm(id, btn) {
    const form = btn.nextElementSibling;
    form.style.display = 'block';
    btn.style.display = 'none';
}

function hideEditForm(form) {
    form.style.display = 'none';
    form.previousElementSibling.style.display = 'inline'; // remet le bouton Modifier
}

async function deleteProduct(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

    try {
        const res = await fetch(`http://localhost:3000/api/products/delete/${id}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        alert(result.message);
        loadProducts(); // recharge la liste après suppression
    } catch (err) {
        console.error(err);
        alert('Erreur serveur.');
    }
}
function editProduct(id, nom, prix, quantite, localisation) {
    // On demande les nouvelles valeurs
    const newNom = prompt('Nom produit:', nom);
    const newPrix = parseFloat(prompt('Prix:', prix));
    const newQuantite = parseInt(prompt('Quantité:', quantite));
    const newLocalisation = prompt('Localisation:', localisation);

    if (!newNom || isNaN(newPrix) || isNaN(newQuantite)) {
        alert('Valeurs invalides');
        return;
    }

    updateProduct(id, newNom, newPrix, newQuantite, newLocalisation);
}

async function updateProduct(id, nom, prix, quantite, localisation) {
    try {
        const res = await fetch(`http://localhost:3000/api/products/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, prix, quantite, localisation })
        });
        const result = await res.json();
        alert(result.message);
        loadProducts(); // recharge la liste après modification
    } catch (err) {
        console.error(err);
        alert('Erreur serveur.');
    }
}


// Charger les produits au démarrage
loadProducts();
