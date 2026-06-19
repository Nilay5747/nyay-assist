let token = "";

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const formData = new URLSearchParams();
    formData.append("username", email); // OAuth2 expects username
    formData.append("password", password);

    try {
        const response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Login failed: " + JSON.stringify(error));
            return;
        }

        const result = await response.json();
        token = result.access_token;
        alert("Login successful!");

        // Redirect to legal advice page after login
        window.location.href = "legal.html";
    } catch (err) {
        console.error(err);
        alert("Login error. Check console.");
    }
}