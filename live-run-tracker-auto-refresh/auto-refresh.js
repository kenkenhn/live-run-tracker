import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";

// === CONFIGURATION ===
const CLIENT_ID = "167635";
const CLIENT_SECRET = "47a41d862e39f865c6aac2e9c14fe27ba3f01477";
const REFRESH_TOKEN = "42d1df2226a49b6cdf2fc39caca2e6f174c79504";

async function main() {
  try {
    // 1️⃣ Get new access token
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("❌ Error getting access token:", tokenData);
      return;
    }
    console.log("✅ Got new access token");

    // 2️⃣ Save it to local OAuth token file
    fs.writeFileSync("strava-oauth-token.json", JSON.stringify({
      access_token: tokenData.access_token,
      expires_at: tokenData.expires_at
    }, null, 2));
    console.log("✅ Saved to strava-oauth-token.json");

    // 3️⃣ Get latest activity data
    const activityRes = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=1", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const activities = await activityRes.json();
    if (!activities || !activities[0]) {
      console.error("❌ Could not get latest activity data:", activities);
      return;
    }

    const latest = activities[0];
    console.log(`✅ Latest activity: ${latest.name}, distance: ${latest.distance}, time: ${latest.elapsed_time}`);

    // 4️⃣ Write clean stats to token.json (for your HTML)
    fs.writeFileSync("../token.json", JSON.stringify({
      distance: latest.distance,
      elapsed_time: latest.elapsed_time
    }, null, 2));
    console.log("✅ Updated ../token.json with live stats");

    // 5️⃣ Commit and push
    exec("git add ../token.json && git commit -m \"Auto update live stats\" && git push", (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Git error: ${stderr}`);
      } else {
        console.log(`✅ Git pushed:\n${stdout}`);
      }
    });

  } catch (err) {
    console.error("❌ Failed during run:", err);
  }
}

main();
