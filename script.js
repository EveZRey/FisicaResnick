document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("problemas.json");
  const data = await response.json();
  const container = document.getElementById("problem-container");

  function renderProblems(list) {
    container.innerHTML = "";
    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
                <div class="materia">${p.materia} - ${p.tema} (ID: ${p.id})</div>
                <h3>${p.enunciado}</h3>
                <ul class="pasos">${p.pasos.map((paso) => `<li>${paso}</li>`).join("")}</ul>
                <div class="respuesta">Respuesta: ${p.respuesta_final}</div>
            `;
      container.appendChild(card);
    });
    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
    });
  }

  renderProblems(data);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = data.filter(
      (p) =>
        p.tema.toLowerCase().includes(term) ||
        p.materia.toLowerCase().includes(term),
    );
    renderProblems(filtered);
  });
});
