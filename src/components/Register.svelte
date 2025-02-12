<script>
    import { rest, registerUser } from "@directus/sdk";
    import directus from "../lib/directus";

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
  
<h2 class="text-sm sm:text-2xl font-semibold mb-4">Create an Account</h2>


{#if success}
<div>
    <p class="mb-4">Account created successfully!</p>
    <p>You should receive an email with a link to verify your account.</p>
</div>
{:else}
<form class="space-y-3" on:submit|preventDefault={handleRegister}>
    <div>
    <label for="firstName" class="text-xs">First Name</label>
    <input
        type="text"
        id="firstName"
        bind:value={firstName}
        placeholder="Enter your first name"
        required
        class="input"
    />
    </div>

    <div>
    <label for="lastName" class="text-xs">Last Name</label>
    <input
        type="text"
        id="lastName"
        bind:value={lastName}
        placeholder="Enter your last name"
        required
        class="input"
    />
    </div>

    <div>
    <label for="email" class="text-xs">Email</label>
    <input
        type="email"
        id="email"
        bind:value={email}
        placeholder="Enter your email"
        required
        class="input"
    />
    </div>

    <div>
    <label for="password" class="text-xs">Password</label>
    <input
        type="password"
        id="password"
        bind:value={password}
        placeholder="Enter your password"
        required
        class="input"
    />
    </div>

    {#if error}
    <p class="error">{error}</p>
    {/if}

    <button
    type="submit"
    class="button"
    >
    Sign Up
    </button>
</form> 
{/if}