const btnTema = document.getElementById("btnTema");
const body = document.getElementById("bodyTema");

function aplicarTema() {
    const tema = localStorage.getItem("tema") || "dark";

    if (tema === "dark") {
        body.classList.remove("bg-white", "text-gray-900");
        body.classList.add("bg-gray-900", "text-white");

        if (btnTema) btnTema.innerHTML = "Light Mode";
    } else {
        body.classList.remove("bg-gray-900", "text-white");
        body.classList.add("bg-white", "text-gray-900");

        if (btnTema) btnTema.innerHTML = "Dark Mode";
    }
}

aplicarTema();

if (btnTema) {
    btnTema.addEventListener("click", () => {
        const atual = localStorage.getItem("tema") || "dark";

        localStorage.setItem("tema", atual === "dark" ? "light" : "dark");

        aplicarTema();
    });
}