// Busqueda global del encabezado.
// Redirige al catalogo con el termino escrito.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formBusquedaCabecera");
  if (!form) return;

  const input = document.getElementById("busquedaCabecera");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const termino = input.value.trim();
    // En el catalogo solo filtra, en otras paginas navega al catalogo
    if (location.pathname.endsWith("catalogo.html")) {
      const buscador = document.getElementById("busqueda");
      if (buscador) {
        buscador.value = termino;
        buscador.dispatchEvent(new Event("input"));
        buscador.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (termino !== "") {
      location.href = "catalogo.html?buscar=" + encodeURIComponent(termino);
    } else {
      location.href = "catalogo.html";
    }
  });
});