<script>
    import DownloadButton from "../components/DownloadButton.svelte";
    import RenewalButton from "../components/RenewalButton.svelte";
    import Cart from "../components/Cart.svelte";

    export let currentUser;
    export let renewalPrices;

    const DIRECTUS_URL = "https://cms.fairclouds.life";

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
        }).format(date);
    };
</script>
  
<main class="p-12">
    {#if currentUser}
        <div class="pr-12">
        <h1>Welcome to your account dashboard, {currentUser.first_name}!</h1>
        <p class="mt-4">You have €{currentUser.credits / 100} in Cloudsteward Credits.</p>

        <h2 class="mt-8">Your Licenses</h2>
        {#if currentUser.licenses?.length > 0}
            <ul>
            {#each currentUser.licenses as license}
                <li class="my-4 flex flex-col gap-2" style="border: 1px solid #ccc; padding: 0.5rem;">
                <h3>{license.price_id.cloud_id.name}</h3>
                <h3>Cloudsteward {license.price_id.tier}</h3>
                <p><strong>Cycle:</strong> {license.price_id.cycle_id.name}</p>
                <p><strong>Start:</strong> {formatDate(license.price_id.cycle_id.start_date)}</p>
                <p><strong>End:</strong> {formatDate(license.price_id.cycle_id.end_date)}</p>

                {#if license.price_id.cloud_id}
                    {#if license.price_id.cloud_id.drawings?.length > 0}
                    <h5 class="my-4">Drawings</h5>
                    <div class="flex flex-wrap gap-1">
                        {#each license.price_id.cloud_id.drawings as drawing}
                        <div style="padding: 0.5rem;">
                            <img 
                            src={`${DIRECTUS_URL}/assets/${drawing.image}`} 
                            alt={`Drawing ${drawing.id}`} 
                            style="max-width: 150px; max-height: 150px;"
                            />
                        </div>
                        {/each}
                    </div>
                    <DownloadButton
                        cloudId={license.price_id.cloud_id.id}
                    />
                    <RenewalButton
                        license={license}
                        renewalPrices={renewalPrices}
                    />
                    {:else}
                    <p>No drawings available for this cloud.</p>
                    {/if}
                {:else}
                    <p>No associated cloud information for this license.</p>
                {/if}
                </li>
            {/each}
            </ul>
        {:else}
            <p>You have no licenses.</p>
        {/if}
        </div>
    {:else}
        <h1>You are not logged in.</h1>
    {/if}

    <div class="fixed right-0 bottom-0 gap-4 p-4 z-20">
        <Cart currentUser={currentUser} />
    </div>
</main>  