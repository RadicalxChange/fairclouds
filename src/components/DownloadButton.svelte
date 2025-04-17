<script lang="ts">
  import { useTranslations } from "../i18n/utils";

  export let cloudId;
  export let lang: "en" | "es" = "en";

  $: t = useTranslations(lang);

  let loading = false;

  async function handleDownload() {
    loading = true;
    const response = await fetch("/api/download-cloud-drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cloudId }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloud-${cloudId}-drawings.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert(t("download_failed"));
    }
    loading = false;
  }
</script>

<div class="my-4">
  <button on:click={handleDownload} disabled={loading} class="button">
    {!loading ? t("download_drawings") : t("downloading_drawings")}
  </button>
</div>