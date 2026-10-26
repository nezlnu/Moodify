const popup = document.getElementById("moodPopup");
const closeButton = document.getElementById("closePopup");
const moodButtons = document.querySelectorAll(".moods button");
 
const activityPopup = document.getElementById("activityPopup");
const activityButtons = document.querySelectorAll(".activities button");
const backToMood = document.getElementById("backToMood");

const energyPopup = document.getElementById("energyPopup");
const energySlider = document.getElementById("energySlider");
const energyValue = document.getElementById("energyValue");
const energyNext = document.getElementById("energyNext");

const spotifyPopup = document.getElementById("spotifyPopup");
const playlistMessage = document.getElementById("playlistMessage");
const spotifyContainer = document.getElementById("spotifyContainer");

const anotherPlaylist = document.getElementById("anotherPlaylist");

let selectedMood = "";
let selectedActivity = "";


// LISTENING HISTORY

async function saveToHistory(playlist, mood, activity, energy) {
    try {
        const response = await fetch('/api/history/', {method:'POST', headers:{'Content-Type':'application/json','X-CSRFToken':document.querySelector('[name=csrfmiddlewaretoken]').value}, body:JSON.stringify({playlist,mood,activity,energy})});
        if (response.status === 401) return; // Guests can discover music without saving data.
        if (!response.ok) throw new Error('History was not saved.');
    } catch (error) { document.getElementById('historyStatus').textContent='Your playlist opened, but history could not be saved. Please try again.'; }
}

// Registration and login

function register() {
    window.location.href = "register.html";
}

function login() {
    window.location.href = "login.html";
}


// Mood selection

moodButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedMood = button.dataset.mood;

        popup.style.display = "none";
        activityPopup.style.display = "flex";
    });
});

closeButton.addEventListener("click", () => {
    popup.style.display = "none";
});


// Activity selection

activityButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedActivity = button.dataset.activity;

        activityPopup.style.display = "none";
        energyPopup.style.display = "flex";
    });
});

backToMood.addEventListener("click", () => {
    activityPopup.style.display = "none";
    popup.style.display = "flex";
});


// Energy slider

energySlider.addEventListener("input", () => {
    energyValue.textContent = energySlider.value;
});


// PLAYLIST LIBRARY

const playlistLibrary = {

    // ACTIVITY-ONLY PLAYLISTS

    studying: [
        "https://open.spotify.com/embed/playlist/14KtkIpsvzDSCXR24EqHCL",
        "https://open.spotify.com/embed/playlist/6yW6dYt73WjUJMHqHeMqVv",
        "https://open.spotify.com/embed/playlist/5jfrAVmWH1qUxDxojmmjSR"
    ],

    exercising: [
        "https://open.spotify.com/embed/playlist/6eDA3IyY3DhrcTHREup9fx",
        "https://open.spotify.com/embed/playlist/28bqh5m3XyaDZahhwoNXp2",
        "https://open.spotify.com/embed/playlist/0io9ZQ8I47fVfeMc5qj1DD"
    ],

    working: [
        "https://open.spotify.com/embed/playlist/2YOW3ZUV7gD2DheVbp7zKM?si=QFFScwS5RM-d6vBXkZxfVw",
        "https://open.spotify.com/embed/playlist/5mej72M9qKQ6MeZIRgilhO?si=XEI2g10VRiaEf2g-0r21OA",
        "https://open.spotify.com/embed/playlist/37i9dQZF1DXcsT4WKI8W8r?si=Bsb91XDWTYul9XQf8_TXtg",
        "https://open.spotify.com/embed/playlist/0MWN3wOovREUj4b0yuEbuw?si=LyO729dfQLKnRpvtnpPFIw"
    ],

    partying: [
        "https://open.spotify.com/embed/playlist/5jZyJezrAr22lDebbPov17?si=Z8n4BONIRaO5ucGEr2abng",
        "https://open.spotify.com/embed/playlist/3M9UqzILAO9VmGNIdneCwu?si=G1GvrJmpTNaNiZBwfNTFVg",
        "https://open.spotify.com/embed/playlist/0GK2zA6K4VLKnKuVsZJPpS?si=FY6Sbo7bTnS4aZ5WP4eXpQ",
        "https://open.spotify.com/playlist/3aYOW3P2wSaoYd8Ppa9RiH?si=VB6w3JouSP2hWLxxPt4inw"
    ],


    // RELAXING: MOOD + ENERGY

    relaxing: {
        happy: {
            low: [
                "https://open.spotify.com/embed/playlist/2RVRqOcGWqg31ke99iH4nm?si=ys-JMe60R06FYpgYTL3bCA"
            ],
            medium: [
                "https://open.spotify.com/embed/playlist/2Vn9oWEj7MDGSMCOX4sc76?si=hryOQkHPRJqfiOGXg3UH2Q"
            ],
            high: [
                "https://open.spotify.com/embed/playlist/07L2VWNAumBXxL1vIzQEEJ?si=dat5m5sDSWKUNSuC8M0Mlw"
            ]
        },

        sad: {
            low: [
                "https://open.spotify.com/embed/playlist/0Z7LCb2wUJRbgwHFC79wAu?si=5DOtrM1fQTOAW2xFRrtY0Q"
            ],
            medium: [
                "https://open.spotify.com/embed/playlist/7J4uv99JEq7cQID9b4HmeO?si=Kuu1WNfFR3eBMVEz3P6mug"
            ],
            high: [
                "https://open.spotify.com/embed/playlist/1e6u0yOpHrzWcb7JSvICeA?si=DPys0AnOSqKWVCu8a6S3ng"
            ]
        }
    },


    // DRIVING: MOOD + ENERGY

    driving: {
        happy: [
                
                "https://open.spotify.com/embed/playlist/78R1KfPXefVYlWxMfEHrzS?si=XU9ShG1ORhmNvwG_WKyeUA",
                "https://open.spotify.com/embed/playlist/0WjAoxcvKz3FFfrxW3lK8K?si=vXK8nqkJSNOPaZCy6bOWFQ",
                "https://open.spotify.com/embed/playlist/4hnTxvr5173d26yEjPlhi2?si=hLhlPcd9SLG8D49nLKCz-w"
            ],

        sad: [
                "https://open.spotify.com/embed/playlist/425DKknrkKuggmrmP0ZjiS?si=Os1yP1nLQ6qfmiGyq2FKng",
                "https://open.spotify.com/embed/playlist/3i5v18ZLlPO84C8eVooZAL?si=kFxNO3TRTqCtkWNw7FKxOg",
                "https://open.spotify.com/embed/playlist/0dfXXnaR76NXHqmn0hrl41?si=2QVbzbjBRtWIJYlRPkjQbQ"
            
        ]
    }

};


// ENERGY LEVEL

function getTirednessLevel(tiredness) {
    if (tiredness <= 30) return "low";
    if (tiredness <= 65) return "medium";
    return "high";
}


// FIND A PLAYLIST

function getPlaylist(mood, activity, tiredness, previousPlaylist = null) {

    let playlists;

    if (activity === "relaxing") {
        const energyLevel = getTirednessLevel(tiredness);
        playlists = playlistLibrary.relaxing?.[mood]?.[energyLevel];

    } else if (activity === "driving") {
        // Driving depends on mood only
        playlists = playlistLibrary.driving?.[mood];

    } else {
        // Other activities depend only on activity
        playlists = playlistLibrary[activity];
    }

    if (!Array.isArray(playlists) || playlists.length === 0) {
        return null;
    }

    // Exclude the currently playing playlist if alternatives exist
    const alternatives = playlists.filter(url => url !== previousPlaylist);

    const availablePlaylists = alternatives.length > 0
        ? alternatives
        : playlists;

    const randomIndex = Math.floor(Math.random() * availablePlaylists.length);

    return availablePlaylists[randomIndex];
}


// DISPLAY THE PLAYLIST

energyNext.addEventListener("click", () => {

    const tiredness = Number(energySlider.value);

    const playlist = getPlaylist(
        selectedMood,
        selectedActivity,
        tiredness
    );

    energyPopup.style.display = "none";
    spotifyPopup.style.display = "flex";

    displayPlaylist(playlist);

    if (playlist && !playlist.includes("YOUR_")) {

        playlistMessage.textContent = "Here's a playlist for you 🎵";

        spotifyContainer.innerHTML = `
            <iframe
                src="${playlist}"
                width="100%"
                height="352"
                style="border: none; border-radius: 12px;"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy">
            </iframe>
        `;

    } else {

        playlistMessage.textContent =
            "Sorry, I don't have a playlist for this combination yet.";

        spotifyContainer.innerHTML = "";
    }
});

let currentPlaylist = null;
let previousPlaylists = [];

function displayPlaylist(playlist) {
    if (!playlist || playlist.includes("YOUR_")) {
        playlistMessage.textContent =
            "Sorry, no playlist is available for this selection.";
        spotifyContainer.innerHTML = "";
        return;
    }

        saveToHistory(
            playlist,
            selectedMood,
            selectedActivity,
            Number(energySlider.value)
        );

    currentPlaylist = playlist;

    playlistMessage.textContent = "Here's a playlist for you 🎵";

    spotifyContainer.innerHTML = `
        <iframe
            src="${playlist}"
            width="100%"
            height="600"
            style="border: none; border-radius: 12px;"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>
    `;
}

anotherPlaylist.addEventListener("click", () => {
    const tiredness = Number(energySlider.value);

    // Get the playlists allowed for the current selection
    let playlists;

    if (selectedActivity === "relaxing") {
        const level = getTirednessLevel(tiredness);
        playlists =
            playlistLibrary.relaxing?.[selectedMood]?.[level];

    } else if (selectedActivity === "driving") {
        playlists = playlistLibrary.driving?.[selectedMood];

    } else {
        playlists = playlistLibrary[selectedActivity];
    }

    if (!Array.isArray(playlists) || playlists.length === 0) {
        playlistMessage.textContent =
            "No playlists are available for this selection.";
        return;
    }

    // Remove the currently playing playlist from the choices
    let alternatives = playlists.filter(
        url => url !== currentPlaylist && !url.includes("YOUR_")
    );

    // If every playlist has been used, start the cycle again
    if (alternatives.length === 0) {
        alternatives = playlists.filter(url => !url.includes("YOUR_"));
    }

    if (alternatives.length === 0) {
        playlistMessage.textContent =
            "Please add real Spotify playlist links first.";
        return;
    }

    const nextPlaylist =
        alternatives[Math.floor(Math.random() * alternatives.length)];

    displayPlaylist(nextPlaylist);
});


// CLOSE SPOTIFY POPUP

document.getElementById("closeSpotify").addEventListener("click", () => {
    spotifyPopup.style.display = "none";
});


// OPEN THE FIRST POPUP

window.addEventListener("DOMContentLoaded", () => {
    popup.style.display = "flex";
});

