<script>
    import { rest, registerUser } from "@directus/sdk";
    import directus from "../lib/directus";
    import { useTranslations } from "../i18n/utils";

    export let lang;
    $: t = useTranslations(lang);

    let email = "";
    let password = "";
    let firstName = "";
    let lastName = "";
    let error = "";
    let success = "";

    const handleRegister = async () => {
        error = "";
        success = "";

        try {
            // Validate inputs
            if (!email || !password || !firstName || !lastName) {
                throw new Error("All fields are required");
            }

            // Use Directus SDK to register the user
            const result = await directus.request(registerUser(email, password, { first_name: firstName, last_name: lastName }));

            success = true;
            console.log("Registration result:", result);
        } catch (err) {
            error = err.message || "Failed to create account.";
        }
    };
</script>
  
<h2 class="text-lg sm:text-2xl font-semibold mb-4">{t("create_account")}</h2>

{#if success}
<div>
    <p class="mb-4">{t("account_created")}</p>
    <p>{t("verification_email")}</p>
</div>
{:else}
<form class="space-y-3" on:submit|preventDefault={handleRegister}>
    <div>
    <label for="firstName" class="text-sm sm:text-base">{t("first_name")}</label>
    <input
        type="text"
        id="firstName"
        bind:value={firstName}
        placeholder={t("first_name")}
        required
    />
    </div>

    <div>
    <label for="lastName" class="text-sm sm:text-base">{t("last_name")}</label>
    <input
        type="text"
        id="lastName"
        bind:value={lastName}
        placeholder={t("last_name")}
        required
    />
    </div>

    <div>
    <label for="email" class="text-sm sm:text-base">{t("email")}</label>
    <input
        type="email"
        id="email"
        bind:value={email}
        placeholder={t("email")}
        required
    />
    </div>

    <div>
    <label for="password" class="text-sm sm:text-base">{t("password")}</label>
    <input
        type="password"
        id="password"
        bind:value={password}
        placeholder={t("password")}
        required
    />
    </div>

    {#if error}
    <p class="error">{error}</p>
    {/if}

    <button
    type="submit"
    class="button"
    >
    {t("sign_up")}
    </button>
</form> 
{/if}