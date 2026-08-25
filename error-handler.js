function showBusuiocError(error) {
    if (document.getElementById("busuiocErrorOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "busuiocErrorOverlay";

    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999999;
    background: #0b0719;
    color: white;
    font-family: 'Segoe UI', Consolas, monospace;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: inset 0 0 100px rgba(244, 63, 94, 0.2);
    animation: crashFadeIn 0.3s ease-out;
  `;

    const safeMessage = String(
        error?.message || "A apărut o eroare necunoscută."
    );

    const safeSource = String(
        error?.source || "Busuioc App"
    );

    overlay.innerHTML = `
    <div style="font-size: 5rem; margin-bottom: 1rem;">:(</div>

    <h1 style="
      font-size: 2.2rem;
      color: #fff;
      margin-bottom: 1rem;
      font-family: var(--font-display, serif);
    ">
      Busuioc App a întâmpinat o eroare
    </h1>

    <p style="
      font-size: 1rem;
      color: #fda4af;
      max-width: 750px;
      line-height: 1.6;
      margin-bottom: 1rem;
      background: rgba(244,63,94,0.1);
      padding: 1.2rem;
      border-radius: 12px;
      border: 1px solid rgba(244,63,94,0.3);
      word-break: break-word;
    ">
      ${escapeHtml(safeMessage)}
    </p>

    <p style="
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 2rem;
    ">
      Sursă: <span style="color:#fb7185;">
        ${escapeHtml(safeSource)}
      </span>
    </p>

    <div style="
      display:flex;
      gap:1rem;
      flex-wrap:wrap;
      justify-content:center;
    ">
      <button
        type="button"
        id="busuiocErrorClose"
        style="
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg,#f43f5e,#e11d48);
          color: white;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
        "
      >
        Continuă
      </button>

      <button
        type="button"
        id="busuiocErrorReload"
        style="
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
        "
      >
        Repornește aplicația
      </button>
    </div>
  `;

    document.body.appendChild(overlay);

    document
        .getElementById("busuiocErrorClose")
        ?.addEventListener("click", () => {
            overlay.remove();
        });

    document
        .getElementById("busuiocErrorReload")
        ?.addEventListener("click", () => {
            window.location.reload();
        });
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
if (window.electronAPI?.onAppError) {
    window.electronAPI.onAppError((error) => {
        console.error("Busuioc App Error:", error);

        showBusuiocError(error);
    });
}
window.addEventListener("error", (event) => {
    console.error("Renderer Error:", event.error);

    showBusuiocError({
        source: "Pagina curentă",
        message: event.error?.message || event.message
    });
});
window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise:", event.reason);

    showBusuiocError({
        source: "JavaScript Promise",
        message:
            event.reason?.message ||
            String(event.reason)
    });
});