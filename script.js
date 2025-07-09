async function getAccessToken() {
  const res = await fetch("token.json");
  const data = await res.json();
  return data.access_token;
}

async function fetchLatestActivity() {
  const token = await getAccessToken();
  const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=1", {
    headers: { "Authorization": "Bearer " + token }
  });
  const DISTANCE_GOAL = 30.0; // miles

let map = L.map('map').setView([0,0], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker = L.marker([0,0]).addTo(map);

async function fetchLatestActivity() {
    try {
        const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=1", {
            headers: { "Authorization": "Bearer " + STRAVA_ACCESS_TOKEN }
        });
        const data = await res.json();
        if (data.length === 0) return;
        const activity = data[0];

        const miles = activity.distance / 1609.34;
        const pace = (activity.moving_time / 60) / miles; // min/mile
        const remaining = DISTANCE_GOAL - miles;
        const eta = remaining * pace;

        document.getElementById("distance").textContent = miles.toFixed(2) + " mi";
        document.getElementById("pace").textContent = pace.toFixed(2) + " min/mi";
        document.getElementById("eta").textContent = eta > 0 ? eta.toFixed(1) + " min" : "Done!";

        // Update map location
        if (activity.start_latlng) {
            let lat = activity.start_latlng[0];
            let lon = activity.start_latlng[1];
            marker.setLatLng([lat, lon]);
            map.setView([lat, lon], 13);
        }
    } catch (err) {
        console.error("Error fetching Strava data:", err);
    }
}

setInterval(fetchLatestActivity, 15000);
fetchLatestActivity();

}

