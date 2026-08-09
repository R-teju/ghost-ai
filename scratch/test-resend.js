const { Resend } = require("resend");
require("dotenv").config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testSend() {
  console.log("Testing Resend API Key:", process.env.RESEND_API_KEY ? "Found key" : "Missing key");
  try {
    const data = await resend.emails.send({
      from: "Ghost AI <onboarding@resend.dev>",
      to: ["ramapriyarj28@gmail.com"],
      subject: "Test Invitation from Ghost AI",
      html: "<p>Hello! This is a test invitation email sent via Resend.</p>",
    });
    console.log("Resend Send Result:", data);
  } catch (err) {
    console.error("Resend Send Error:", err);
  }
}

testSend();
