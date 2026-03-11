const API_URL = "http://localhost:3000/api/users";

// --- INSCRIPTION ---
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nom: document.getElementById('regNom').value,
        email: document.getElementById('regEmail').value,
        telephone: document.getElementById('regPhone').value,
        mot_de_passe: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
    };
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        if(res.ok) window.location.href = "login.html";
    } catch(err) {
        console.error(err);
        alert("Erreur serveur");
    }
});

// --- CONNEXION ---
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById('loginEmail').value,
        mot_de_passe: document.getElementById('loginPassword').value
    };
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(res.ok && result.token){
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            // Redirection selon le rôle
            if(result.user.role === "agriculteur") window.location.href = "dashboard.html";
            else window.location.href = "/frontend/catalogue.html";
        } else {
            alert(result.message || "Erreur de connexion");
        }
    } catch(err){
        console.error(err);
        alert("Erreur serveur");
    }
});
const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
    
});
<script src="auth.js"></script>

