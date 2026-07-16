export function createWelcomeEmailTemplate(name, email, password, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Chatify</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg" alt="Chatify Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Chatify!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join Chatify! Your account has been successfully created. You can use the following credentials to log in:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px dashed #5B86E5;">
        <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>🔑 Password:</strong> <span style="color: #e74c3c;">${password}</span></p>
      </div>

      <div style="background-color: #fff9db; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #fcc419;">
        <p style="margin: 0; font-size: 14px; color: #856404;">⚠️ <strong>Security Tip:</strong> Please keep your password safe and don't share it with anyone.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Chatify</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Chatify Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2026 Chatify. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
}

