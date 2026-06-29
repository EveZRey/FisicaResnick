document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("problemas.json");
    if (!response.ok) throw new Error("No se pudo cargar el JSON");
    const data = await response.json();

    const problemView = document.getElementById("problem-view");
    const formulasView = document.getElementById("formulas-view");
    const searchInput = document.getElementById("searchInput");

    const groupedData = data.reduce((acc, curr) => {
      const safeId = String(curr.id || "0");

      let capName = "Temas Generales";
      if (safeId.includes("-")) {
        const capID = safeId.split("-")[0];
        capName = `Capítulo ${capID.replace("C", "")}`;
      }

      if (!acc[capName]) acc[capName] = [];
      acc[capName].push(curr);
      return acc;
    }, {});

    function renderSidebar(groups) {
      const sidebar = document.getElementById("chapter-list");
      sidebar.innerHTML = "";

      for (const [chapter, problems] of Object.entries(groups)) {
        if (problems.length === 0) continue;

        const details = document.createElement("details");

        if (Object.keys(groups)[0] === chapter) details.open = true;

        const summary = document.createElement("summary");
        summary.innerHTML = `📁 ${chapter} <span style="float:right; font-size:0.8em; color:#888;">${problems.length}</span>`;
        details.appendChild(summary);

        problems.forEach((p) => {
          const btn = document.createElement("button");
          btn.className = "problem-btn";

          const safeId = String(p.id);
          const numProblema = safeId.includes("-")
            ? safeId.split("-")[1]
            : safeId;

          btn.innerText = `📄 Problema ${numProblema} - ${p.tema}`;
          btn.onclick = () => loadProblem(p, btn);
          details.appendChild(btn);
        });

        sidebar.appendChild(details);
      }
    }

    function loadProblem(p, activeBtn) {
      document
        .querySelectorAll(".problem-btn")
        .forEach((b) => b.classList.remove("active"));
      if (activeBtn) activeBtn.classList.add("active");

      problemView.innerHTML = `
        <div class="problem-card">
            <div class="tag">${p.materia} | ID: ${p.id}</div>
            <h2 class="enunciado">${p.enunciado}</h2>
            <ul class="pasos-list">
                ${p.pasos.map((paso) => `<li>${paso}</li>`).join("")}
            </ul>
            <div class="respuesta-box">
                Respuesta Final: ${p.respuesta_final}
            </div>
        </div>
      `;

      const textToScan = p.enunciado + " " + p.pasos.join(" ");

      const regex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
      const rawMatches = [...textToScan.matchAll(regex)].map((m) => m[0]);

      const uniqueFormulas = [...new Set(rawMatches)].filter(
        (f) => f.includes("=") || f.includes("\\"),
      );

      if (uniqueFormulas.length > 0) {
        formulasView.innerHTML = uniqueFormulas
          .map((f) => `<div class="formula-item">${f}</div>`)
          .join("");
      } else {
        formulasView.innerHTML = `<p class="empty-text">No se detectaron fórmulas complejas en este problema.</p>`;
      }

      if (typeof renderMathInElement !== "undefined") {
        renderMathInElement(problemView, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
        });
        renderMathInElement(formulasView, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
        });
      }

      if (window.innerWidth <= 900) {
        problemView.scrollIntoView({ behavior: "smooth" });
      }
    }

    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filteredGroups = {};

      for (const [chapter, problems] of Object.entries(groupedData)) {
        filteredGroups[chapter] = problems.filter(
          (p) =>
            p.tema.toLowerCase().includes(term) ||
            p.enunciado.toLowerCase().includes(term) ||
            String(p.id).toLowerCase().includes(term),
        );
      }
      renderSidebar(filteredGroups);
    });

    renderSidebar(groupedData);
  } catch (error) {
    console.error(error);
    document.getElementById("chapter-list").innerHTML =
      `<p style="color:red; padding:20px;">Error al cargar datos.</p>`;
  }
});
