<script lang="ts">
    import DownloadButton from "../components/DownloadButton.svelte";
    import RenewalButton from "../components/RenewalButton.svelte";
    import Cart from "../components/Cart.svelte";
    import { useTranslations } from "../i18n/utils";
    import { formatDate } from "../utils/format-date"

    export let currentUser;
    export let renewalPrices;
    export let lang: "en" | "es" = "en";

    $: t = useTranslations(lang);

    const DIRECTUS_URL = "https://cms.fairclouds.life";
</script>
  
<main class="p-12">
    {#if currentUser}
        <div class="pr-12">
            <h2>{t("cloud_panel")}</h2>
            {#if currentUser.licenses?.length > 0}
                <ul>
                    {#each currentUser.licenses as license}
                        <li class="my-4 flex flex-col gap-2" style="border: 1px solid #ccc; padding: 0.5rem;">
                            <h3>{license.price_id.cloud_id.name}</h3>
                            <h3>{t("you_are")} Cloudsteward {license.price_id.tier}</h3>
                            <p>{t("your_stewardship_began")} {formatDate(license.price_id.cycle_id.start_date)}.</p>
                            <p>{t("license_expires")} {formatDate(license.price_id.cycle_id.end_date)}.</p>

                            {#if license.price_id.cloud_id}
                                {#if license.price_id.cloud_id.drawings?.length > 0}
                                    <h5 class="my-4">{t("drawings")}</h5>
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
                                    <div class="flex gap-8 items-center">
                                        <DownloadButton
                                            lang={lang}
                                            cloudId={license.price_id.cloud_id.id}
                                        />
                                        <a class="icon-button has-hint relative" target="_blank" href={`/${lang}/faq/what-to-do-with-the-drawings`}>
                                            <span class="text-xl sm:text-3xl pt-[4px]">i</span>
                                            <div role="tooltip" class="hint top-[0%] -mt-7 right-0 w-max">
                                              {t("what_to_do_with_drawings")}
                                            </div>
                                        </a>
                                    </div>
                                    <RenewalButton
                                        lang={lang}
                                        license={license}
                                        renewalPrices={renewalPrices}
                                    />
                                {:else}
                                    <p>{t("no_drawings")}</p>
                                {/if}
                            {:else}
                                <p>{t("no_cloud_info")}</p>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>{t("you_have_no_licenses")}</p>
            {/if}
        </div>
    {:else}
        <h1>{t("not_logged_in")}</h1>
    {/if}

    <div class="fixed right-0 bottom-0 gap-4 p-4 z-20">
        <Cart lang={lang} currentUser={currentUser} />
    </div>
</main>  