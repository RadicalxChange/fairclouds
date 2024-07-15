<script lang="ts">
  let responseMessage: string;
  
  async function submit(e: Event) {
    e.preventDefault();
    const formData = new FormData((e.target as HTMLFormElement));
    const response = await fetch("/api/send-magic-link", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    responseMessage = data.message;
  }
</script>

<form on:submit={submit}>
  <label>
    Email
    <input type="email" id="email" name="email" required />
  </label>
  <button type="submit">Send</button>
  {#if responseMessage}
    <p>{responseMessage}</p>
  {/if}
</form>

<!-- <script>
  var form = document.getElementById("login-form");
  async function handleSubmit(event) {
    event.preventDefault();
    var status = document.getElementById("my-form-status");
    var data = new FormData(event.target);
    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (response.ok) {
          status.innerHTML = "Thanks for your submission!";
          form.reset();
        } else {
          response.json().then((data) => {
            if (Object.hasOwn(data, "errors")) {
              status.innerHTML = data["errors"]
                .map((error) => error["message"])
                .join(", ");
            } else {
              status.innerHTML =
                "Oops! There was a problem submitting your form";
            }
          });
        }
      })
      .catch((error) => {
        status.innerHTML = "Oops! There was a problem submitting your form";
      });
  }
  form.addEventListener("submit", handleSubmit);
</script> -->
