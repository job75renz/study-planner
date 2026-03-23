let chart;

async function addTask() {
  const subject = document.getElementById("subject").value;
  const task = document.getElementById("task").value;
  const deadline = document.getElementById("deadline").value;

  if (!subject || !task || !deadline) {
    alert("Fill all fields");
    return;
  }

  try {
    await fetch("http://localhost:5000/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, task, deadline, status: "Pending" })
    });
    // ✅ Clear inputs after adding
    document.getElementById("subject").value = "";
    document.getElementById("task").value = "";
    document.getElementById("deadline").value = "";
  } catch(e) {
    alert("❌ Could not add task. Is the server running?");
    return;
  }

  loadTasks();
}

async function loadTasks() {
  let data;

  // ✅ Fix Bug 4: catch fetch errors instead of silently failing
  try {
    const res = await fetch("http://localhost:5000/tasks");
    data = await res.json();
  } catch(e) {
    console.error("❌ Could not connect to server:", e);
    alert("Cannot reach server. Is it running on port 5000?");
    return;
  }

  const list = document.getElementById("taskList");
  const todayDiv = document.getElementById("todayTasks");
  const planner = document.getElementById("planner");

  list.innerHTML = "";
  todayDiv.innerHTML = "";
  planner.innerHTML = "";

  let done = 0;
  const today = new Date().toISOString().split("T")[0];

  data.forEach(t => {
    if (t.status === "Done") done++;

    const div = document.createElement("div");
    div.className = "task";

    if (t.deadline < today) {
      div.style.border = "2px solid red";
    }

    div.innerHTML = `
      <span>${t.subject} - ${t.task} (${t.deadline})</span>
      <button onclick="markDone('${t._id}')">✔</button>
      <button onclick="deleteTask('${t._id}')">❌</button>
    `;

    list.appendChild(div);

    if (t.deadline === today) {
      const p = document.createElement("p");
      p.innerText = t.task;
      todayDiv.appendChild(p);
    }
  });

  document.getElementById("total").innerText = data.length;
  document.getElementById("done").innerText = done;
  document.getElementById("pending").innerText = data.length - done;

  const percent = data.length ? (done / data.length) * 100 : 0;
  document.getElementById("progressBar").style.width = percent + "%";

  // ✅ Fix Bug 2: added backgroundColor so chart actually renders
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("myChart"), {
    type: "doughnut",
    data: {
      labels: ["Done", "Pending"],
      datasets: [{
        data: [done, data.length - done],
        backgroundColor: ["#4fc3f7", "#f48fb1"]  // ✅ blue for done, pink for pending
      }]
    },
    options: {
      responsive: false
    }
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  days.forEach((d, i) => {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.innerHTML = `<b>${d}</b>`;

    data.forEach(t => {
      const date = new Date(t.deadline);
      if (date.getDay() === i) {
        const p = document.createElement("p");
        p.innerText = t.task;
        dayDiv.appendChild(p);
      }
    });

    planner.appendChild(dayDiv);
  });
}

async function deleteTask(id) {
  try {
    await fetch(`http://localhost:5000/delete/${id}`, { method: "DELETE" });
  } catch(e) {
    alert("❌ Could not delete task.");
    return;
  }
  loadTasks();
}

async function markDone(id) {
  try {
    await fetch(`http://localhost:5000/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Done" })
    });
  } catch(e) {
    alert("❌ Could not update task.");
    return;
  }
  loadTasks();
}

// ✅ Fix Bug 1: wait for DOM to be ready before loading tasks
document.addEventListener("DOMContentLoaded", loadTasks);