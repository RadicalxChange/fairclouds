<script>
  export let cloudId;

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
      alert('Failed to download. Please try again.');
    }
    loading = false;
  }
</script>

<button on:click={handleDownload} disabled={loading} class="button">
  {!loading ? "Download All Drawings" : "Downloading drawings..."}
</button>