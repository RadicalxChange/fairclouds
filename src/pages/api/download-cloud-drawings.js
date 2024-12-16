// dont prerender as this page will be unique.
export const prerender = false;

import AdmZip from 'adm-zip';

export const POST = async ({ request }) => {
  const { cloudId } = await request.json();
  const DIRECTUS_URL = "https://cms.fairclouds.life"

  try {
    // Fetch the drawings associated with the cloudId
    const response = await fetch(`${DIRECTUS_URL}/items/drawings?filter[cloud_id][_eq]=${cloudId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.DIRECTUS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.errors[0].message || 'Failed to fetch drawings' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: drawings } = await response.json();
    const zip = new AdmZip();

    // Create an array of promises for each image fetch
    const imagePromises = drawings.map(drawing => {
      const imageUrl = `${DIRECTUS_URL}/assets/${drawing.image}`;
      return fetch(imageUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch image ${drawing.image}`);
          return res.arrayBuffer();
        })
        .then(buffer => ({
          title: drawing.title,
          buffer: buffer
        }))
        .catch(err => {
          console.error('Error downloading image:', err);
          return null; // Continue with other images even if this one fails
        });
    });

    // Wait for all fetch operations to complete
    const images = await Promise.all(imagePromises);

    // Add each image to the zip if the fetch was successful
    images.forEach(image => {
      if (image) { // Check if the image was successfully fetched
        zip.addFile(`${image.title}.png`, new Uint8Array(image.buffer), "File downloaded from Directus");
      }
    });

    const zipBuffer = zip.toBuffer();

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="cloud-drawings.zip"'
      }
    });
  } catch (err) {
    console.error("Error creating zip file:", err); // Log the error
    return new Response(JSON.stringify({ error: 'Failed to zip images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
