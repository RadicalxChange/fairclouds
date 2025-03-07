const BASE_URL = import.meta.env.PUBLIC_BASE_URL

export async function sendMail(email, templateId, templateModel) {
    try {
        const response = await fetch(BASE_URL + "/api/send-mail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                templateId: templateId,
                templateModel: templateModel
            }),
        });

        const responseBody = response.json();
        console.log(responseBody);

        if (!response.ok) {
            throw new Error(`Error code ${responseBody.ErrorCode}: ${responseBody.Message}`);
        }
        return { ok: true };
    } catch (e) {
        console.error("Error sending email:", e);
        return { ok: false, error: e.toString() };
    }
}