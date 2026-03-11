const API_URL = "http://localhost:3000/api/users";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Récupération des valeurs
    const data = {
        nom: document.getElementById('regNom').value,
        email: document.getElementById('regEmail').value,
        telephone: document.getElementById('regPhone').value,
        mot_de_passe: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
    };

    console.log("Données inscription :", data);

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log("Réponse backend :", result);

        alert(result.message);

        if (res.ok) {
            // Rediriger vers la page de connexion
            window.location.href = "login.html";
        }

    } catch (err) {
        console.error("Erreur fetch :", err);
        alert("Erreur serveur : voir console");
    }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('loginEmail').value,
        mot_de_passe: document.getElementById('loginPassword').value
    };

    console.log("Données connexion :", data);

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log("Réponse backend :", result);

        if (res.ok && result.token) {
            // Stocker le token JWT dans localStorage
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Redirection selon le rôle
            if (result.user.role === "agriculteur") {
                window.location.href = "dashboard.html";
            } else if (result.user.role === "acheteur") {
                window.location.href = "catalog.html";
            }
        } else {
            alert(result.message || "Erreur lors de la connexion");
        }

    } catch (err) {
        console.error("Erreur fetch :", err);
        alert("Erreur serveur : voir console");
    }
});
