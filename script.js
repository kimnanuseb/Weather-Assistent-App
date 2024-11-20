const apiKey = '55b7b2b6cc14a3f0db1c8d830ba965bb'; // Pre-integrated OpenWeatherMap API key

document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('city').value.trim();
    if (city) {
        getWeather(city);
        saveSearch(city);
    } else {
        alert('Please enter a city name.');
    }
});

function updateBackground(condition) {
    document.body.className = 'default'; // Reset background
    if (condition.includes('clear')) {
        document.body.classList.add('sunny');
    } else if (condition.includes('rain')) {
        document.body.classList.add('rainy');
    } else if (condition.includes('cloud')) {
        document.body.classList.add('cloudy');
    }
}

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeather(data);
            updateBackground(data.weather[0].description.toLowerCase());
        } else {
            document.getElementById('weatherResult').innerHTML = '<p>City not found. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = '<p>There was an error retrieving the data. Please try again later.</p>';
    }
}

function displayWeather(data) {
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    const windDirection = getWindDirection(data.wind.deg);
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const weatherHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${weatherIcon}" alt="${data.weather[0].description}">
        <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
        <p><strong>Condition:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s (${windDirection})</p>
        <p><strong>Sunrise:</strong> ${sunriseTime}</p>
        <p><strong>Sunset:</strong> ${sunsetTime}</p>
    `;
    document.getElementById('weatherResult').innerHTML = weatherHTML;
}

function getWindDirection(degree) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degree % 360) / 45) % 8;
    return directions[index];
}

function saveSearch(city) {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    if (!searches.includes(city)) {
        searches.push(city);
        localStorage.setItem('searches', JSON.stringify(searches));
    }
    displaySearchHistory();
}

function displaySearchHistory() {
    const searches = JSON.parse(localStorage.getItem('searches')) || [];
    const historyHTML = searches
        .map(city => `<button onclick="getWeather('${city}')">${city}</button>`)
        .join('');
    document.getElementById('searchHistory').innerHTML = historyHTML;
}

// Display saved search history on page load
document.addEventListener('DOMContentLoaded', displaySearchHistory);
