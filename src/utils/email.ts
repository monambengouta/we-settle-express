import nodemailer from "nodemailer";

export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail", // Use other services if needed
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Email sending function
export const sendEmail = async (mailOptions: MailOptions): Promise<boolean> => {
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
