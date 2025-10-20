import emailjs from "emailjs-com";

export async function sendReportEmail(ip, email, functions) {
    try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE;   // service id
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE; // template id
        const userId = import.meta.env.VITE_EMAILJS_PUBLICKEY;    // public key
        const now = new Date();
        const sentAt = now.toLocaleString("en-GB", { hour12: false }); 

        // whitelist các field cần giữ lại
        const allowedFields = [
            "Elapsed Time (sec)",
            "Valid Code Count",
            "Reading Phase Count",
            "Number of Decoded Codes",
            "Good Read Count",
            "Partial Read Count",
            "No Read Count",
            "No Code Count",
            "Multiple Read Count",
            "Successful Collection Count",
            "Failed Collection Count",
            "Match Code Count",
            "No Match Code Count",
            "Average Barcode X Pixel Position On Image",
            "Average Barcode Y Pixel Position On Image",
            "Frame Rate (fps)",
            "Conveyor Speed (mm/sec)",
            "Encoder Frequency",
            "Average Codes or Labels Found",
            "Average Decoding Time (ms)",
            "Image Acquisition Counter",
            "Average Image Aquisition Time (ms)",
            "Average Image Processing Time (ms)"
        ];

        // chỉ lấy field được whitelist
        const filteredEntries = Object.entries(functions).filter(([key]) =>
            allowedFields.includes(key)
        );

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
            ${filteredEntries
                .map(
                    ([key, value]) => `
                    <tr>
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
