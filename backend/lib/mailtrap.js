import { config } from "dotenv";
config();
import { MailtrapClient } from "mailtrap";
const TOKEN=process.env.MAILTRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({
    token: TOKEN,
});

export const sender={
    email:process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME,
};
export const recipients=[
    {
        email: "hammad.scripted@gmail.com",
    }
];

