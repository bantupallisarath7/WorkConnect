import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `
        <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#f97316;">LabourConnect</h2>
            
            <p>Hello,</p>
            <p>Your OTP for email verification is:</p>
            
            <h1 style="letter-spacing:5px; color:#111;">${otp}</h1>
            
            <p>This OTP is valid for 5 minutes.</p>
            
            <hr/>
            <p style="font-size:12px; color:gray;">
                If you didn’t request this, please ignore this email.
            </p>
        </div>`,
    });
};