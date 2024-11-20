const apiKey = 'fd679ad0b218886d1a36dc41a919d0e7'; // API key

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

// Show loading animation while fetching weather
function showLoading() {
    document.getElementById('weatherResult').innerHTML = '<div class="loader">Loading...</div>';
}

// Get weather data for the user's location automatically
function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    showLoading(); // Show loading spinner

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            updateBackground(data); // Apply background gradient
            getWeatherAlerts(data.city.name); // Fetch weather alerts for warnings
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weatherResult').innerHTML = `<p>There was an error retrieving the data. Please try again later.</p>`;
        });
}

// Automatically get the user's location when the page loads
navigator.geolocation.getCurrentPosition(function (position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherByCoordinates(lat, lon); // Fetch weather for the user's location
});

// Get weather data when user clicks "Get Weather"
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

// Function to fetch weather data from OpenWeatherMap API
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    showLoading(); // Show loading spinner

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '200') {
            displayWeather(data);
            updateBackground(data); // Apply dynamic background
            getWeatherAlerts(data.city.name); // Fetch weather alerts for warnings
        } else {
            document.getElementById('weatherResult').innerHTML = `<p>City not found. Please try again.</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = `<p>There was an error retrieving the data. Please try again later.</p>`;
    }
}

// Function to display the current weather details
function displayWeather(data) {
    const currentWeather = data.list[0];

    // Get weather icon and group the weather details
    const weatherIcon = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;

    const currentHTML = `
        <div class="current-weather">
            <h2 class="city-name">${data.city.name}, ${data.city.country}</h2>
            <div class="weather-details">
                <img src="${weatherIcon}" alt="${currentWeather.weather[0].description}">
                <div class="weather-info">
                    <p><strong>Temperature:</strong> ${currentWeather.main.temp}°C</p>
                    <p><strong>Condition:</strong> ${currentWeather.weather[0].description}</p>
                    <p><strong>Humidity:</strong> ${currentWeather.main.humidity}%</p>
                    <p><strong>Wind:</strong> ${currentWeather.wind.speed} m/s</p>
                </div>
            </div>
        </div>
    `;

    // 7-day forecast (grouped and organized)
    const forecast = data.list.filter((_, index) => index % 8 === 0).slice(0, 7);
    const forecastHTML = `
        <div class="forecast">
            <h3>7-Day Forecast</h3>
            <div class="forecast-grid">
                ${forecast
                    .map(day => {
                        const forecastEmoji = getWeatherEmoji(day.weather[0].description);
                        return `
                            <div class="forecast-card">
                                <p>${new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short' })}</p>
                                <p>${day.main.temp}°C</p>
                                <p>${forecastEmoji} ${day.weather[0].description}</p>
                            </div>
                        `;
                    })
                    .join('')}
            </div>
        </div>
    `;

    document.getElementById('weatherResult').innerHTML = currentHTML + forecastHTML;
}

// Function to map weather descriptions to emojis
function getWeatherEmoji(description) {
    if (description.includes('clear')) {
        return '🌞'; // Sun for clear weather
    } else if (description.includes('rain')) {
        return '🌧️'; // Cloud with rain for rainy weather
    } else if (description.includes('cloud')) {
        return '☁️'; // Cloud for cloudy weather
    } else if (description.includes('snow')) {
        return '❄️'; // Snowflake for snowy weather
    } else if (description.includes('mist')) {
        return '🌫️'; // Fog/mist for misty weather
    } else {
        return '⛅'; // Default (partly cloudy)
    }
}

// Function to update the background with gradient colors based on weather
function updateBackground(data) {
    const weatherCondition = data.list[0].weather[0].main.toLowerCase();

    // Apply gradient based on weather condition
    if (weatherCondition.includes('clear')) {
        document.body.style.background = 'linear-gradient(to bottom, #ffbb33, #ff6600)'; // Sunny gradient
    } else if (weatherCondition.includes('rain')) {
        document.body.style.background = 'linear-gradient(to bottom, #66b3ff, #0099cc)'; // Rainy gradient
    } else if (weatherCondition.includes('cloud')) {
        document.body.style.background = 'linear-gradient(to bottom, #d6d6d6, #b3c7d6)'; // Cloudy gradient
    } else if (weatherCondition.includes('snow')) {
        document.body.style.background = 'linear-gradient(to bottom, #ffffff, #cce0ff)'; // Snowy gradient
    } else {
        document.body.style.background = 'linear-gradient(to bottom, #4facfe, #00f2fe)'; // Default gradient (e.g., mist)
    }
}

// Fetch and display weather alerts
async function getWeatherAlerts(city) {
    const url = `https://api.openweathermap.org/data/2.5/alerts?q=${city}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.alerts) {
        displayWeatherAlerts(data.alerts);
    }
}

function displayWeatherAlerts(alerts) {
    alerts.forEach(alert => {
        const alertHTML = `<div class="alert">${alert.event}: ${alert.description}</div>`;
        document.getElementById('weatherAlerts').innerHTML += alertHTML;
    });
}
