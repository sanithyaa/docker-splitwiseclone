// =============================
// CONFIG
// =============================
const API = "http://localhost:5000";

let groupId = localStorage.getItem("groupId");

let chartInstance = null;


// =============================
// AVATAR GENERATOR
// =============================
function getAvatar(name) {

    if (!name) return "?";

    return name.charAt(0).toUpperCase();

}


// =============================
// CREATE GROUP
// =============================
async function createGroup() {

    const nameInput = document.getElementById("groupName");
    const membersInput = document.getElementById("members");

    if (!nameInput || !membersInput) return;

    const name = nameInput.value.trim();
    const members = membersInput.value.split(",").map(m => m.trim());

    if (!name || members.length === 0) {

        alert("Enter group name and members");
        return;

    }

    await fetch(`${API}/groups`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            members
        })

    });

    alert("Group created");

    nameInput.value = "";
    membersInput.value = "";

    loadGroups();

}


// =============================
// LOAD GROUPS
// =============================
async function loadGroups() {

    const div = document.getElementById("groups");

    if (!div) return;

    const res = await fetch(`${API}/groups`);

    const groups = await res.json();

    div.innerHTML = "";

    groups.forEach(group => {

        div.innerHTML += `
        <div class="group" onclick="openGroup('${group.id}')">

            <strong>${group.name}</strong><br>

            <small>${group.members.join(", ")}</small>

        </div>
        `;

    });

}


// =============================
// OPEN GROUP
// =============================
function openGroup(id) {

    localStorage.setItem("groupId", id);

    window.location.href = "group.html";

}


// =============================
// GO BACK
// =============================
function goBack() {

    window.location.href = "index.html";

}


// =============================
// ADD EXPENSE WITH CATEGORY
// =============================
async function addExpense() {

    const desc = document.getElementById("desc").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const paidBy = document.getElementById("paidBy").value.trim();
    const category = document.getElementById("category").value;

    if (!desc || !amount || !paidBy) {

        alert("Fill all fields");
        return;

    }

    // get group members
    const groupRes = await fetch(`${API}/groups`);
    const groups = await groupRes.json();

    const group = groups.find(g => g.id === groupId);

    if (!group) {

        alert("Group not found");
        return;

    }

    await fetch(`${API}/expenses`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            group_id: groupId,
            description: desc,
            amount: amount,
            paid_by: paidBy,
            split_between: group.members,
            category: category

        })

    });

    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("paidBy").value = "";

    loadExpenses();
    loadBalances();
    loadChart();

}


// =============================
// LOAD EXPENSES WITH AVATARS
// =============================
async function loadExpenses() {

    const div = document.getElementById("expenses");

    if (!div || !groupId) return;

    const res = await fetch(`${API}/expenses/${groupId}`);

    const expenses = await res.json();

    div.innerHTML = "";

    expenses.forEach(exp => {

        div.innerHTML += `
        <div class="expense-row">

            <div class="avatar">
                ${getAvatar(exp.paid_by)}
            </div>

            <div>

                <strong>${exp.description}</strong><br>

                ₹${exp.amount} • ${exp.category}<br>

                Paid by ${exp.paid_by}

            </div>

        </div>
        `;

    });

}


// =============================
// LOAD BALANCES
// =============================
async function loadBalances() {

    const div = document.getElementById("balances");

    if (!div || !groupId) return;

    const res = await fetch(`${API}/balances/${groupId}`);

    const balances = await res.json();

    div.innerHTML = "";

    for (let person in balances) {

        let value = balances[person];

        let text = "";

        if (value > 0)
            text = `${person} gets ₹${value.toFixed(2)}`;
        else if (value < 0)
            text = `${person} owes ₹${Math.abs(value).toFixed(2)}`;
        else
            text = `${person} is settled`;

        div.innerHTML += `
        <div class="card">
            ${text}
        </div>
        `;

    }

}


// =============================
// SETTLE UP
// =============================
async function settleUp() {

    if (!groupId) return;

    if (!confirm("Settle all balances?")) return;

    await fetch(`${API}/settle/${groupId}`, {

        method: "POST"

    });

    alert("Group settled!");

    loadExpenses();
    loadBalances();
    loadChart();

}


// =============================
// LOAD PIE CHART
// =============================
async function loadChart() {

    const canvas = document.getElementById("chart");

    if (!canvas || !groupId) return;

    const res = await fetch(`${API}/expenses/${groupId}`);

    const expenses = await res.json();

    const totals = {};

    expenses.forEach(exp => {

        totals[exp.category] =
        (totals[exp.category] || 0) + exp.amount;

    });

    const labels = Object.keys(totals);
    const values = Object.values(totals);

    if (chartInstance)
        chartInstance.destroy();

    chartInstance = new Chart(canvas, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{
                data: values
            }]

        }

    });

}


// =============================
// AUTO LOAD
// =============================
loadGroups();
loadExpenses();
loadBalances();
loadChart();
