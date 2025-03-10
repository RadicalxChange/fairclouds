<script lang="ts">
    import Login from "./Login.svelte";
    export let lang: "en" | "es";
    export let currentUser: any;
</script>

<Login lang={lang} currentUser={currentUser} on:loginSuccess={() => window.location.reload()} />
  