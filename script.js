const apiKey = 'fd679ad0b218886d1a36dc41a919d0e7';

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

// Get weather data
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '200') {
            displayWeather(data);
        } else {
            document.getElementById('weatherResult').innerHTML = `<p>City not found. Please try again.</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = `<p>There was an error retrieving the data. Please try again later.</p>`;
    }
}

function displayWeather(data) {
    const currentWeather = data.list[0];
    const forecast = data.list.filter((_, index) => index % 8 === 0).slice(0, 7);

    const weatherIcon = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;
    const windDirection = getWindDirection(currentWeather.wind.deg);
    const sunriseTime = new Date(data.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(data.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const currentHTML = `
        <div class="current-weather">
            <h2>${data.city.name}, ${data.city.country}</h2>
            <img src="${weatherIcon}" alt="${currentWeather.weather[0].description}">
            <p><strong>Temperature:</strong> ${currentWeather.main.temp}°C</p>
            <p><strong>Condition:</strong> ${currentWeather.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${currentWeather.main.humidity}%</p>
            <p><strong>Wind:</strong> ${currentWeather.wind.speed} m/s (${windDirection})</p>
            <p><strong>Sunrise:</strong> ${sunriseTime}</p>
            <p><strong>Sunset:</strong> ${sunsetTime}</p>
        </div>
    `;

    const forecastHTML = `
        <div class="forecast">
            <h3
