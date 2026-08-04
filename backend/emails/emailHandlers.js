
import {sender,mailtrapClient} from '../lib/mailtrap.js';

export const sendWelcomeEmail=(email,name,profilePictureUrl)=>{
    const recipient = [{ email }];
    try {
        const response=await mailtrapClient.send({
            to: recipient,
            from:sender,
            html:createWelcomeEmailTemplate(name,profilePictureUrl),
            category:'Welcome Email',
        })
        console.log(`Welcome email sent to ${email} successfully`,response);
    } catch (error) {
        
    }
    
}