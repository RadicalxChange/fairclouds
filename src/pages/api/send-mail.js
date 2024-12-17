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
      From: 'alex@radicalxchange.org',
      To: email,
      TemplateId: templateId,
      TemplateModel: templateModel
    };
    console.log("email data:", emailData)

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
      const errorResponse = await postmarkResponse.json(); // Read and parse the JSON response body
      console.log(errorResponse); // Now you're logging the actual error response from Postmark
      return new Response(JSON.stringify({ message: "Error sending email" }), { status: postmarkResponse.status });
    }

    return new Response(JSON.stringify({ message: "Email sent" }), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};