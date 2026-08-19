
import {
  emailTransport,
  emailTransportMode,
  sender,
} from '../lib/mailtrap.js';
import {
  createCommentNotificationEmailTemplate,
  createConnectionAcceptedEmailTemplate,
  createWelcomeEmailTemplate,
} from './emailTemplates.js';

const sendEmail = async ({ to, subject, html, text, category }) => {
  if (!to) throw new Error('An email recipient is required');

  try {
    const response = await emailTransport.sendMail({
      to,
      from: sender,
      subject,
      html,
      text,
      headers: { 'X-Email-Category': category },
    });

    console.log(
      `${category} sent to ${to} using Mailtrap ${emailTransportMode}; message ID: ${response.messageId}`,
    );
    return response;
  } catch (error) {
    console.error(
      `Unable to send ${category.toLowerCase()} to ${to}:`,
      error.message,
    );
    throw error;
  }
};

export const sendWelcomeEmail = (email, name, profileUrl) =>
  sendEmail({
    to: email,
    subject: 'Welcome to LinkedIn!',
    html: createWelcomeEmailTemplate(name, profileUrl),
    text: `Welcome to LinkedIn, ${name}. Complete your profile: ${profileUrl}`,
    category: 'Welcome Email',
  });

export const sendConnectionAcceptedEmail = (
  email,
  senderName,
  recipientName,
  profileUrl,
) =>
  sendEmail({
    to: email,
    subject: `${recipientName} accepted your connection request`,
    html: createConnectionAcceptedEmailTemplate(
      senderName,
      recipientName,
      profileUrl,
    ),
    text: `${recipientName} accepted your connection request. View their profile: ${profileUrl}`,
    category: 'Connection Accepted Email',
  });

export const sendCommentNotificationEmail = (
  email,
  recipientName,
  commenterName,
  postUrl,
  commentContent,
) =>
  sendEmail({
    to: email,
    subject: `${commenterName} commented on your post`,
    html: createCommentNotificationEmailTemplate(
      recipientName,
      commenterName,
      postUrl,
      commentContent,
    ),
    text: `${commenterName} commented on your post: "${commentContent}". View it: ${postUrl}`,
    category: 'Comment Notification Email',
  });
