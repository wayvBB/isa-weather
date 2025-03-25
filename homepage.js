const API_KEY = "0b0d8a5bd8f549d46f795f02f6ac498f";
const DEFAULT_LAT = 8.4542;
const DEFAULT_LON = 124.6319;
const DEFAULT_CITY = "Cagayan de Oro";

// Function to get coordinates by city name
function getCoordinates(cityName) {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    return fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                return {
                    lat: data[0].lat,
                    lon: data[0].lon,
                    name: data[0].name
                };
            } else {
                throw new Error("City not found");
            }
        });
}

// Function to get weather data
function getWeather(lat, lon, unit = "metric", cityName = DEFAULT_CITY) {
    const units = unit === "imperial" ? "imperial" : "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const temp = data.main.temp;
                const unitSymbol = unit === "imperial" ? "°F" : "°C";
                const weatherDesc = data.weather[0].description;
                const temperatureCondition = getTemperatureCondition(temp, unit);
                const location = cityName || data.name;
                const icon = data.weather[0].icon;

                document.getElementById("location-text").textContent = `📍 ${location}`;
                document.querySelector(".temp-section").textContent = `${temp}${unitSymbol}`;
                document.querySelector(".desc-box").textContent = `${weatherDesc} - ${temperatureCondition}`;
                
                // Update character image based on temperature condition
                updateCharacterImage(temperatureCondition);

                console.log(`📍 Location: ${location}`);
                console.log(`🌡️ Temperature: ${temp}${unitSymbol}`);
                console.log(`🌥️ Condition: ${weatherDesc}`);
                console.log(`📝 Description: ${temperatureCondition}`);
            } else {
                console.log("Error:", data.message);
            }
        })
        .catch(error => {
            console.log("Error fetching data:", error);
            document.getElementById("location-text").textContent = `Error: ${error.message}`;
        });
}

// Function to update character image based on temperature
function updateCharacterImage(temperatureCondition) {
    const characterImage = document.querySelector(".character-image");
    
    if (temperatureCondition.includes("Freezing") || temperatureCondition.includes("Cold")) {
        characterImage.src = "img/winter.png";
    } else if (temperatureCondition.includes("Hot") || temperatureCondition.includes("Very Hot")) {
        characterImage.src = "img/sunny.png";
    } else {
        characterImage.src = "img/cute.png"; // default image
    }
}

// Function to determine weather description based on temperature
function getTemperatureCondition(temp, unit) {
    let celsius = unit === "imperial" ? (temp - 32) * 5/9 : temp;

    if (celsius <= 0) {
        return 'Freezing cold ❄️';
    }
    else if (celsius <= 10) {
        return 'Very Cold ☃️';
    }
    else if (celsius <= 15) {
        return 'Cold 🧥';
    }
    else if (celsius <= 20) {
        return 'Mild 🌥️';
    }
    else if (celsius <= 25) {
        return 'Warm 🌤️';
    }
    else if (celsius <= 30) {
        return 'Hot ☀️';
    }
    else if (celsius <= 35) {
        return 'Very Hot 🌡️';
    }
    else {
        return 'Extremely Hot 🌋';
    }
}

// Function to perform search
function performSearch() {
    const searchInput = document.querySelector(".search-bar");
    const cityName = searchInput.value.trim();

    if (cityName) {
        // Get coordinates first, then fetch weather
        getCoordinates(cityName)
            .then(coords => {
                getWeather(coords.lat, coords.lon, "metric", coords.name);
                searchInput.value = ""; // Clear search input
            })
            .catch(error => {
                console.log(error);
                document.getElementById("location-text").textContent = `📍 City not found`;
            });
    }
}

// Window load event - default to Cagayan de Oro
window.onload = function () {
    getWeather(DEFAULT_LAT, DEFAULT_LON, "metric", DEFAULT_CITY);
};

// Search button click event
document.querySelector(".search-button").addEventListener("click", performSearch);

// Search input enter key event
document.querySelector(".search-bar").addEventListener("keypress", function(event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission
        performSearch();
    }
});

// Temperature unit switcher
document.querySelectorAll(".unit-btn").forEach(button => {
    button.addEventListener("click", function () {
        const selectedUnit = this.textContent === "°F" ? "imperial" : "metric";
        const currentLocation = document.getElementById("location-text").textContent.replace("📍 ", "");
        
        // If current location is default or already loaded
        if (currentLocation === "Loading Location..." || currentLocation === DEFAULT_CITY) {
            getWeather(DEFAULT_LAT, DEFAULT_LON, selectedUnit, DEFAULT_CITY);
        } else {
            // For searched locations
            getCoordinates(currentLocation)
                .then(coords => {
                    getWeather(coords.lat, coords.lon, selectedUnit, coords.name);
                });
        }
    });
});
