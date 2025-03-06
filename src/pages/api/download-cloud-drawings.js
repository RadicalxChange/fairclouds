// dont prerender as this page will be unique.
export const prerender = false;

import JSZip from 'jszip';

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
    
    const zip = new JSZip();

    // Create an array of promises for each asset (image and svg)
    const assetPromises = drawings.flatMap(drawing => {
      const promises = [];
      
      if (drawing.image) {
        const imageUrl = `${DIRECTUS_URL}/assets/${drawing.image}`;
        promises.push(
          fetch(imageUrl)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch image ${drawing.image}`);
              return res.arrayBuffer();
            })
            .then(buffer => ({
              title: drawing.title,
              content: buffer,
              extension: 'png'
            }))
            .catch(err => {
              console.error('Error downloading image:', err);
              return null;
            })
        );
      }

      if (drawing.svg) {
        const svgUrl = `${DIRECTUS_URL}/assets/${drawing.svg}`;
        promises.push(
          fetch(svgUrl)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch SVG ${drawing.svg}`);
              return res.text();
            })
            .then(text => ({
              title: drawing.title,
              content: text,
              extension: 'svg'
            }))
            .catch(err => {
              console.error('Error downloading SVG:', err);
              return null;
            })
        );
      }
      return promises;
    });

    // Wait for all fetch operations to complete
    const assets = await Promise.all(assetPromises);

    // Add each successfully fetched asset to the zip file
    assets.forEach(asset => {
      if (asset) {
        // Use the drawing title and appropriate extension
        const filename = `${asset.title}.${asset.extension}`;
        if (asset.extension === 'svg') {
          zip.file(filename, asset.content); // SVG as text
        } else {
          zip.file(filename, asset.content, { binary: true });
        }
      }
    });

    const zipBuffer = await zip.generateAsync({type: "uint8array"});

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
