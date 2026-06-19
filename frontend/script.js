let token = "";
let userEmail = "";

// --------------------
// Navigation
// --------------------
function showSection(section) {
    ["home", "register", "login", "legal", "resources"].forEach(sec => {
        const el = document.getElementById(`${sec}-section`);
        if (el) el.classList.add("hidden");
    });

    if (section === "home") {
        document.getElementById("home-section").style.display = "flex";
        document.getElementById("highlights-panel").style.display = "none";
    } else {
        document.getElementById("home-section").style.display = "none";
        document.getElementById(`${section}-section`).classList.remove("hidden");

        if(section === "legal") {
            initHighlights();
        } else {
            document.getElementById("highlights-panel").style.display = "none";
        }
    }
}

// --------------------
// Register
// --------------------
async function registerUser() {
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    if (!email || !password) { alert("Please enter email and password"); return; }

    try {
        const res = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            alert("Registration failed: " + JSON.stringify(err));
            return;
        }
        alert("Registration successful! Login now.");
        document.getElementById("reg-email").value = "";
        document.getElementById("reg-password").value = "";
        showSection("login");
    } catch (err) {
        console.error(err);
        alert("Registration error. Check console.");
    }
}

// --------------------
// Login
// --------------------
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) { alert("Please enter email and password"); return; }

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const res = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });
        if (!res.ok) {
            const err = await res.json();
            alert("Login failed: " + JSON.stringify(err));
            return;
        }

        const result = await res.json();
        token = result.access_token;
        userEmail = email;

        document.getElementById("nav-login").classList.add("hidden");
        document.getElementById("nav-register").classList.add("hidden");
        document.getElementById("nav-logout").classList.remove("hidden");
        document.getElementById("nav-legal").classList.remove("hidden");
        document.getElementById("user-info").innerHTML = `<i class="fas fa-user"></i> Logged in as: ${userEmail}`;
        showSection("legal");
        document.getElementById("response").classList.add("hidden");

        alert("Login successful!");
    } catch (err) {
        console.error(err);
        alert("Login error. Check console.");
    }
}

// --------------------
// Logout
// --------------------
function logout() {
    token = "";
    userEmail = "";
    document.getElementById("nav-login").classList.remove("hidden");
    document.getElementById("nav-register").classList.remove("hidden");
    document.getElementById("nav-logout").classList.add("hidden");
    document.getElementById("nav-legal").classList.add("hidden");
    document.getElementById("user-info").innerText = "";
    document.getElementById("response").innerText = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("highlights-panel").style.display = "none";
    showSection("home");
    alert("Logged out successfully!");
}

// --------------------
// Legal Advice
// --------------------
let searchHistory = [];

async function getLegalAdvice() {
    if (!token) { alert("You must login first!"); return; }

    const situation = document.getElementById("situation").value;
    if (!situation) { alert("Please describe your situation."); return; }

    searchHistory.push(situation);
    renderSearchHistory();

    try {
        const res = await fetch(`http://127.0.0.1:8000/legal-advice?situation=${encodeURIComponent(situation)}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            const err = await res.json();
            document.getElementById("response").innerHTML = `<div class="card">Error: ${JSON.stringify(err)}</div>`;
            document.getElementById("response").classList.remove("hidden");
            return;
        }

        const data = await res.json();
        document.getElementById("response").innerHTML = `
            <div class="card">
                <h3><i class="fas fa-gavel"></i> Matched Scenario <span class="badge">${data.matched_scenario}</span></h3>
            </div>
            <div class="card">
                <h3><i class="fas fa-book"></i> Legal Basis</h3>
                <p>${data.legal_basis}</p>
            </div>
            <div class="card">
                <h3><i class="fas fa-balance-scale"></i> Rights Summary</h3>
                <p>${data.structured_rights}</p>
            </div>
            <div class="card">
                <h3><i class="fas fa-robot"></i> AI Explanation</h3>
                <p>${data.ai_explanation.replace(/\n/g, "<br>")}</p>
            </div>
            <div class="card disclaimer">
                <p>${data.disclaimer}</p>
            </div>
        `;
        document.getElementById("response").classList.remove("hidden");

    } catch (err) {
        console.error(err);
        alert("Request error. Check console.");
    }
}

// --------------------
// Search History Rendering
// --------------------
function renderSearchHistory() {
    let container = document.getElementById("search-history-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "search-history-container";
        container.style.marginTop = "20px";
        container.innerHTML = `<h3>Search History</h3><ul id="history-list"></ul>`;
        document.getElementById("legal-section").appendChild(container);
    }
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    searchHistory.slice().reverse().forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.style.marginBottom = "6px";
        li.style.fontSize = "0.95em";
        list.appendChild(li);
    });
}

// --------------------
// Constitution Highlights Animation
// --------------------
function initHighlights() {
    const panel = document.getElementById('highlights-panel');
    panel.innerHTML = '<h3>Constitution Highlights</h3>'; // header stays
    panel.style.display = 'flex';

    const ul = document.createElement('ul');
    ul.id = 'highlights-list';

    const highlights = [
        "Right to Equality (Article 14) — Equality before the law and equal protection of the laws for all citizens",
        "Right to Equality (Article 15) — Prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth",
        "Right to Equality (Article 16) — Equality of opportunity in public employment",
        "Right to Freedom of Speech and Expression (Article 19(1)(a)) — Freedom to express opinions freely, subject to reasonable restrictions",
        "Right to Assemble Peacefully (Article 19(1)(b)) — Right to hold peaceful meetings and demonstrations",
        "Right to Form Associations or Unions (Article 19(1)(c)) — Freedom to form associations, trade unions, or societies",
        "Right to Move Freely Throughout India (Article 19(1)(d)) — Freedom of movement within the country",
        "Right to Reside and Settle in Any Part of India (Article 19(1)(e)) — Freedom to choose residence anywhere in India",
        "Right to Practice Any Profession or Occupation (Article 19(1)(g)) — Freedom to pursue any lawful profession, trade, or business",
        "Right to Freedom (Article 20) — Protection in respect of conviction for offenses, including protection from double jeopardy",
        "Right to Life and Personal Liberty (Article 21) — Right to life, personal liberty, and security, including privacy",
        "Right to Education (Article 21A) — Free and compulsory education for children aged 6 to 14 years",
        "Right against Exploitation (Article 23) — Prohibition of human trafficking and forced labor",
        "Right against Exploitation (Article 24) — Prohibition of child labor in factories, mines, and hazardous work",
        "Right to Freedom of Religion (Articles 25–28) — Freedom of conscience, religious practice, and protection of religious institutions",
        "Cultural and Educational Rights (Articles 29–30) — Protection of minorities' culture, language, and right to establish educational institutions",
        "Right to Constitutional Remedies (Article 32) — Right to approach the Supreme Court or High Courts for enforcement of fundamental rights",
        "Right to Privacy — Protection of personal data and privacy under law",
        "Right to Information — Right to access government records and promote transparency",
        "Right to Property Safeguard (Article 300A) — Protection of property against arbitrary state seizure",
        "Right to Health — Access to healthcare and safe living conditions",
        "Right to Work — Opportunity for livelihood and employment",
        "Right to Shelter — Basic housing for all",
        "Right to Food — Access to adequate nutrition and food security",
        "Right to Social Security — Protection for vulnerable populations including old-age and unemployment benefits",
        "Right to Development — Opportunity to grow socially, economically, and politically",
        "Right to Fair Trial — Access to an impartial and timely judicial process",
        "Right to Vote — Participation in democratic governance",
        "Right to Legal Aid — Access to free or affordable legal representation",
        "Right to Environment — Protection of clean air, water, and ecological balance",
        "Right to Childhood Protection — Safeguarding children against abuse and exploitation",
        "Right against Untouchability — Prohibition of caste-based discrimination",
        "Right to Cultural Preservation — Protection of traditional practices and heritage",
        "Right to Minority Education — Access to education for minority groups",
        "Right to Marriage — Freedom to marry and choose a partner with consent",
        "Right to Participate in Governance — Engagement in public administration and policy decisions",
        "Right to Religious Freedom — Choice to follow or practice any religion",
        "Right to Freedom from Torture — Protection from cruel, inhuman, or degrading treatment",
        "Right to Fair Compensation — Just compensation for land acquisition or loss",
        "Right to Access Public Documents — Transparency in governance and administrative records",
        "Right to Petition the Government — Ability to raise grievances or suggestions with authorities",
        "Right against Arbitrary Detention — Protection from unlawful or indefinite imprisonment"
    ];

    // Append each highlight item
    highlights.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
    });

    // Duplicate for smooth infinite scrolling
    highlights.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
    });

    panel.appendChild(ul);

    // --- JS fix to prevent overlap ---
    const headerHeight = panel.querySelector('h3').offsetHeight;
    ul.style.top = `${headerHeight}px`;  // position scroll below header
    ul.style.animation = `scroll-up 240s linear infinite`;  // preserve smooth scroll
}