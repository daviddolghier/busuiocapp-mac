(() => {
  if (!window.mediaLibrary?.onUpdateAvailable) return;


  // ==========================================================
  // UPDATE DIALOG
  // ==========================================================

  let dialog = null;


  function createDialog() {
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.className = "app-update-dialog";

    dialog.innerHTML = `
            <div class="app-update-card">

                <div class="app-update-brand">

                    <strong class="app-update-title">
                        Busuioc App
                    </strong>
                </div>

                <div id="updateContent" class="update-content"></div>

            </div>
        `;

    document.body.appendChild(dialog);

    return dialog;
  }



  // ==========================================================
  // HELPERS
  // ==========================================================

  function cleanText(value = "") {
    const div = document.createElement("div");
    div.innerHTML = value;

    return div.textContent || div.innerText || "";
  }


  function createList(text) {
    const clean = cleanText(String(text));

    if (!clean.trim()) {
      return `
                <li>
                    Îmbunătățiri și corecții.
                </li>
            `;
    }


    return clean
        .split(/\r?\n/)
        .filter(line => line.trim())
        .map(line => {

          line = line.replace(/^[-•]\s*/, "");

          return `
                    <li>
                        ${line}
                    </li>
                `;

        })
        .join("");
  }



  // ==========================================================
  // UPDATE AVAILABLE
  // ==========================================================

  window.mediaLibrary.onUpdateAvailable(
      ({ version, description }) => {

        const modal = createDialog();

        const content =
            modal.querySelector("#updateContent");


        content.innerHTML = `

                <h2>
                    Versiunea ${version}
                    este disponibilă!
                </h2>


                <p class="update-label">
                    Ce s-a implementat:
                </p>


                <ul class="update-list">
                    ${createList(description)}
                </ul>


                <div class="update-actions">

                    <button 
                        id="updateLater"
                        class="update-btn secondary"
                    >
                        Mai târziu
                    </button>


                    <button 
                        id="updateNow"
                        class="update-btn primary"
                    >
                        Actualizează
                    </button>

                </div>

            `;



        // Închidere

        content
            .querySelector("#updateLater")
            .onclick = () => {
          modal.close();
        };



        // Update

        content
            .querySelector("#updateNow")
            .onclick = async () => {


          content.innerHTML = `

                        <h2>
                            Se actualizează...
                        </h2>


                        <p>
                            Se descarcă versiunea ${version}
                        </p>


                        <div class="update-progress">

                            <span></span>

                        </div>


                        <small id="updatePercent">
                            0%
                        </small>

                    `;


          await window.mediaLibrary.downloadUpdate();

        };



        modal.showModal();

      }
  );



  // ==========================================================
  // DOWNLOAD PROGRESS
  // ==========================================================

  window.mediaLibrary.onUpdateProgress(
      ({ percent }) => {

        const bar =
            document.querySelector(
                ".update-progress span"
            );


        const text =
            document.getElementById(
                "updatePercent"
            );


        const value =
            Math.round(percent);



        if (bar) {
          bar.style.width = `${value}%`;
        }


        if (text) {
          text.textContent = `${value}%`;
        }

      }
  );



  // ==========================================================
  // UPDATE FINISHED
  // ==========================================================

  window.mediaLibrary.onUpdateReady(() => {

    const text =
        document.getElementById(
            "updatePercent"
        );


    if (text) {

      text.textContent =
          "Actualizarea este gata. Aplicația repornește…";

    }

  });


})();