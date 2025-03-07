// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async ({ request }) => {

  try {
    const { 
        email,
        templateId,
        templateModel
     } = await request.json();

    // Send email via Postmark
    const postmarkUrl = 'https://api.postmarkapp.com/email/withTemplate';

    const emailData = {
      From: 'hola@fairclouds.life',
      To: email,
      TemplateId: templateId,
      TemplateModel: templateModel
    };
    console.log("Sending email:", emailData)

    const postmarkResponse = await fetch(postmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': import.meta.env.POSTMARK_API_TOKEN,
      },
      body: JSON.stringify(emailData)
    });

    if (!postmarkResponse.ok) {
      const errorResponse = await postmarkResponse.json();
      console.error("Postmark error:", errorResponse)
      return new Response(JSON.stringify({ message: "Postmark Error" }), { status: postmarkResponse.status });
    }

    return new Response(JSON.stringify({ message: "Email sent" }), { status: 200 });
  } catch (e) {
    console.error("Error sending email:", e);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};