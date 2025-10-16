    import emailjs from "emailjs-com";

    export async function sendReportEmail(ip, email, functions) {
    try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE;   // service id
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE; // template id
        const userId = import.meta.env.VITE_EMAILJS_PUBLICKEY;    // public key
        const now = new Date();
        const sentAt = now.toLocaleString("en-GB", { hour12: false }); 
        const functionsTable = `
        <p><b>Device IP:</b> ${ip}</p>
        <p><b>Receiver:</b> ${email}</p>
        <p><b>Sent at:</b> ${sentAt}</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial; font-size: 14px; width: 100%;">
            <thead style="background-color:#f2f2f2; text-align: left;">
            <tr>
                <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Value</th>
            </tr>
            </thead>
            <tbody>
            ${Object.entries(functions)
                .map(
                ([key, value]) =>
                    `<tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${key}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
        </table>
        `;

        const templateParams = {
            ip,
            email,
            sent_at: sentAt,
            functions_html: functionsTable,
        };

        const response = await emailjs.send(serviceId, templateId, templateParams, userId);
        console.log("📧 EmailJS response:", response.status, response.text);
        console.log(functionsTable);
        return `Report sent successfully to ${email}`;
    } catch (err) {
        console.error("❌ EmailJS Error:", err);
        return `❌ Failed to send report: ${err.text || err.message}`;
    }
    }
