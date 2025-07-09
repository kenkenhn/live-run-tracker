import fetch from "node-fetch";
import fs from "fs";

// === CONFIGURATION ===
const CLIENT_ID = "167635";
const CLIENT_SECRET = "47a41d862e39f865c6aac2e9c14fe27ba3f01477";
const REFRESH_TOKEN = "42d1df2226a49b6cdf2fc39caca2e6f174c79504";
const TOKEN_FILE = "token.json";

// === MAIN FUNCTION ===
async function refreshAccessToken() {
  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN
      })
    });

    const data = await response.json();
    if (data.access_token) {
      console.log("✅ Got new access token:", data.access_token);

      // Write it to token.json
      fs.writeFileSync(TOKEN_FILE, JSON.stringify({
        access_token: data.access_token,
        expires_at: data.expires_at
      }, null, 2));
      console.log(`✅ Updated ${TOKEN_FILE}`);
    } else {
      console.error("❌ Error response from Strava:", data);
    }
  } catch (err) {
    console.error("❌ Failed to refresh token:", err);
  }
}

refreshAccessToken();
