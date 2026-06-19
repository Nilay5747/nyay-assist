// --------------------
// Register Page Script
// --------------------
async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            alert("Registration failed: " + JSON.stringify(result));
            return;
        }

        alert("Registration successful! You can now login.");
        // Optionally redirect to login page
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);
        alert("Registration error. Check console.");
    }
}