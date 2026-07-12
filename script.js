const apiKey = "YOUR_OPENWEATHER_API_KEY";

/* 🌤️ Emoji mapper */
function getWeatherEmoji(condition) {
  switch (condition.toLowerCase()) {
    case "clear": return "☀️";
    case "clouds": return "☁️";
    case "rain":
    case "drizzle": return "🌧️";
    case "thunderstorm": return "⛈️";
    case "snow": return "❄️";
    case "mist":
    case "fog":
    case "haze": return "🌫️";
    default: return "🌍";
  }
}

/* 🌍 Fetch current weather */
function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("location").innerText =
        `${data.name}, ${data.sys.country}`;

      document.getElementById("temperature").innerText =
        Math.round(data.main.temp);

      document.getElementById("humidity").innerText =
        data.main.humidity;

      document.getElementById("wind").innerText =
        data.wind.speed;

      document.getElementById("condition").innerText =
        data.weather[0].main;

      document.getElementById("emoji").innerText =
        getWeatherEmoji(data.weather[0].main);

      document.getElementById("sunrise").innerText =
        formatTime(data.sys.sunrise);

      document.getElementById("sunset").innerText =
        formatTime(data.sys.sunset);

      fetchHourly(data.coord.lat, data.coord.lon);
    });
}

/* ⏰ Hourly forecast */
function fetchHourly(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(data => showHourlyForecast(data.hourly));
}

function showHourlyForecast(hours) {
  const container = document.getElementById("hourlyForecast");
  container.innerHTML = "";

  hours.slice(0, 12).forEach(hour => {
    const time = new Date(hour.dt * 1000)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    container.innerHTML += `
      <div class="hour-card">
        <p>${time}</p>
        <p class="emoji">${getWeatherEmoji(hour.weather[0].main)}</p>
        <p>${Math.round(hour.temp)}°C</p>
      </div>
    `;
  });
}

/* 🔍 City autocomplete */
function searchCities() {
  const input = document.getElementById("cityInput").value;
  const suggestions = document.getElementById("suggestions");

  if (input.length < 1) {
    suggestions.innerHTML = "";
    return;
  }

  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(data => {
      suggestions.innerHTML = "";

      data.forEach(city => {
        const div = document.createElement("div");
        div.innerText = `${city.name}, ${city.country}`;
        div.onclick = () => {
          document.getElementById("cityInput").value = city.name;
          suggestions.innerHTML = "";
          getWeather();
        };
        suggestions.appendChild(div);
      });
    });
}

/* 🧼 Hide suggestions when clicking outside */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    document.getElementById("suggestions").innerHTML = "";
  }
});

/* ⏱️ Time formatter */
function formatTime(ts) {
  return new Date(ts * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
