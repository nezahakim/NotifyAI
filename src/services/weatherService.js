const axios = require("axios");
const woGen = require("../AI/woGen");

const API_KEY = "df8172766924437e90c181751242207";
var UserID;
var CityName;

const weatherService = async (bot, chatId, city) => {
  try {
    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`,
    );
    const data = response.data;
    UserID = chatId;
    CityName = city;

    // Generate detailed weather description
    const weatherDescription = await generateWeatherDescription(data);

    // Send weather icon and detailed description
    const iconUrl = `http:${data.current.condition.icon}`;
    await bot.sendPhoto(chatId, iconUrl, {
      caption: weatherDescription,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    await bot.sendMessage(
      chatId,
      "Sorry, I couldn't fetch the weather information. Please try again later.",
    );
  }
};

const generateWeatherDescription = async (data) => {
  const { location, current } = data;

  let description = `🌡 *Weather in ${location.name}*\n\n`;
  description += `*Current Conditions:* ${current.condition.text}\n`;
  description += `*Temperature:* ${Math.round(current.temp_c)}°C (feels like ${Math.round(current.feelslike_c)}°C)\n`;
  description += `*Humidity:* ${current.humidity}%\n`;
  description += `*Wind:* ${current.wind_kph} km/h`;

  if (current.wind_degree) {
    description += ` from ${getWindDirection(current.wind_degree)}`;
  }

  description += `\n*Pressure:* ${current.pressure_mb} hPa\n`;

  if (location.localtime_epoch) {
    const sunrise = new Date(
      location.localtime_epoch * 1000,
    ).toLocaleTimeString();
    const sunset = new Date(
      (location.localtime_epoch + 12 * 3600) * 1000,
    ).toLocaleTimeString(); // Assuming 12 hours difference for sunset
    description += `*Sunrise:* ${sunrise}\n`;
    description += `*Sunset:* ${sunset}\n\n`;
  }

  description += await getWeatherAdvice(
    current.temp_c,
    current.condition.code,
    current.wind_kph,
  );

  return description;
};

const getWindDirection = (degree) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degree / 45) % 8];
};

const getWeatherAdvice = async (temp, weatherCode, windSpeed) => {
  let advice = "*Weather Advice:*\n";

  if (temp < 10) {
    advice += "• It's cold outside. Don't forget to wear warm clothes!\n";
  } else if (temp > 25) {
    advice +=
      "• It's quite warm. Stay hydrated and seek shade when possible.\n";
  }

  if (weatherCode >= 1000 && weatherCode < 1030) {
    advice +=
      "• Clear or partly cloudy sky. Great day for outdoor activities!\n";
  } else if (weatherCode >= 1030 && weatherCode < 1200) {
    advice +=
      "• Cloudy conditions. It might be a good idea to have a light jacket handy.\n";
  } else if (weatherCode >= 1200 && weatherCode < 1300) {
    advice += "• Rainy conditions. Consider bringing an umbrella.\n";
  } else if (weatherCode >= 1300 && weatherCode < 1400) {
    advice += "• Snowy conditions. Drive carefully if you're on the road.\n";
  } else if (weatherCode >= 1400 && weatherCode < 1500) {
    advice += "• Thunderstorm conditions. Stay indoors and avoid open areas.\n";
  }

  if (windSpeed > 20) {
    advice += "• Strong winds. Secure any loose objects outdoors.\n";
  }

  let fullResponse = "";
  let enhancedInput =
    "In 50 words tell me an Advice for that Temperature:" +
    advice +
    " Temperature is " +
    temp +
    " and the weather is " +
    weatherCode +
    " and the wind speed is " +
    windSpeed +
    " The City Name is " +
    CityName;
  for await (const chunk of woGen.generateText(UserID, enhancedInput)) {
    fullResponse += chunk;
  }
  return "*Weather Advice:*\n" + fullResponse;
};

module.exports = weatherService;
