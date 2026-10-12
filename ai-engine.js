/**
 * Atmosphere AI - Intelligent Weather & Recommendation Engine
 * Analyzes meteorological data to produce smart natural language digests, outfit guides,
 * activity scores, and interactive Q&A answers.
 */
class AtmosphereAIEngine {
    constructor() {
        this.wmoCodes = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 48: "Depositing rime fog",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
            95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
        };
    }

    getConditionText(code) {
        return this.wmoCodes[code] || "Variable conditions";
    }

    generateDailyDigest(weatherData, locationName) {
        const current = weatherData.current;
        const temp = Math.round(current.temperature_2m);
        const feel = Math.round(current.apparent_temperature);
        const condition = this.getConditionText(current.weather_code).toLowerCase();
        const wind = Math.round(current.wind_speed_10m);
        const humidity = current.relative_humidity_2m;
        const daily = weatherData.daily;
        const maxTemp = Math.round(daily.temperature_2m_max[0]);
        const minTemp = Math.round(daily.temperature_2m_min[0]);
        const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;

        let tone = "Pleasant and balanced day.";
        if (temp > 30) tone = "Expect warm to hot conditions today.";
        else if (temp < 10) tone = "Chilly atmosphere throughout the day.";
        else if (rainProb > 50) tone = "Keep an umbrella handy as precipitation is likely.";

        let summary = `In **${locationName}**, current weather features ${condition} at **${temp}°C** (feels like **${feel}°C**). `;
        summary += `Daytime temperatures will peak around **${maxTemp}°C** and drop to **${minTemp}°C** overnight. `;
        summary += `Wind speeds are cruising around **${wind} km/h** with **${humidity}%** humidity. `;
        summary += `${tone}`;

        return summary;
    }

    generateOutfitRecommendation(weatherData) {
        const current = weatherData.current;
        const temp = current.temperature_2m;
        const wind = current.wind_speed_10m;
        const rainProb = weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[0] : 0;
        const uvIndex = weatherData.daily.uv_index_max ? weatherData.daily.uv_index_max[0] : 0;

        let top = "";
        let bottom = "";
        let accessories = [];

        // Temperature based
        if (temp >= 28) {
            top = "Breathable linen shirt or cotton t-shirt";
            bottom = "Light shorts or airy trousers";
        } else if (temp >= 18) {
            top = "Long-sleeve t-shirt or light knitwear";
            bottom = "Jeans or casual chinos";
        } else if (temp >= 8) {
            top = "Layered sweater with a warm jacket";
            bottom = "Thick denim jeans or warm pants";
        } else {
            top = "Insulated thermal top with a heavy winter coat";
            bottom = "Thermal trousers or heavy pants";
        }

        // Accessories based on conditions
        if (rainProb > 40 || [51,53,55,61,63,65,80,81,82,95].includes(current.weather_code)) {
            accessories.push("Waterproof umbrella ☂️");
            accessories.push("Water-resistant footwear 👢");
        }
        if (uvIndex >= 5) {
            accessories.push("UV400 Sunglasses 🕶️");
            accessories.push("Sunscreen (SPF 30+) 🧴");
        }
        if (wind > 25) {
            accessories.push("Windbreaker layer 🌬️");
        }
        if (temp < 10) {
            accessories.push("Beanie & neck scarf 🧣");
        }

        if (accessories.length === 0) {
            accessories.push("Comfortable walking shoes 👟");
        }

        return {
            top,
            bottom,
            accessories: accessories.join(", ")
        };
    }

    calculateActivityScores(weatherData) {
        const current = weatherData.current;
        const temp = current.temperature_2m;
        const wind = current.wind_speed_10m;
        const rainProb = weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[0] : 0;
        const cloudCover = current.cloud_cover || 0;

        // Running / Jogging (Ideal: 12-20°C, low rain, low wind)
        let runningScore = 100;
        if (temp < 5 || temp > 28) runningScore -= 30;
        if (rainProb > 30) runningScore -= rainProb * 0.7;
        if (wind > 20) runningScore -= (wind - 20) * 2;
        runningScore = Math.max(10, Math.min(100, Math.round(runningScore)));

        // Outdoor Dining (Ideal: 20-26°C, clear sky, calm wind)
        let diningScore = 100;
        if (temp < 15 || temp > 32) diningScore -= 40;
        if (rainProb > 20) diningScore -= rainProb * 0.8;
        if (wind > 15) diningScore -= 25;
        diningScore = Math.max(5, Math.min(100, Math.round(diningScore)));

        // Cycling (Ideal: 15-24°C, low wind < 15 km/h, dry)
        let cyclingScore = 100;
        if (wind > 25) cyclingScore -= 45;
        if (rainProb > 30) cyclingScore -= 40;
        if (temp < 8 || temp > 30) cyclingScore -= 20;
        cyclingScore = Math.max(10, Math.min(100, Math.round(cyclingScore)));

        // Stargazing / Night Astronomy (Ideal: clear sky, low clouds, no rain)
        let stargazingScore = 100 - cloudCover;
        if (rainProb > 20) stargazingScore -= 40;
        stargazingScore = Math.max(0, Math.min(100, Math.round(stargazingScore)));

        // Photography (Ideal: interesting sky, pleasant light, low extreme wind/rain)
        let photographyScore = 85;
        if (cloudCover > 30 && cloudCover < 70) photographyScore += 15; // Golden clouds
        if (rainProb > 60) photographyScore -= 35;
        photographyScore = Math.max(15, Math.min(100, Math.round(photographyScore)));

        return [
            { name: "Running & Fitness", score: runningScore, icon: "🏃" },
            { name: "Outdoor Dining", score: diningScore, icon: "☕" },
            { name: "Cycling & Biking", score: cyclingScore, icon: "🚴" },
            { name: "Landscape Photography", score: photographyScore, icon: "📷" },
            { name: "Night Stargazing", score: stargazingScore, icon: "✨" }
        ];
    }

    answerUserQuestion(questionText, weatherData, locationName) {
        const q = questionText.toLowerCase();
        const current = weatherData.current;
        const temp = Math.round(current.temperature_2m);
        const wind = Math.round(current.wind_speed_10m);
        const rainProb = weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[0] : 0;
        const uvIndex = weatherData.daily.uv_index_max ? weatherData.daily.uv_index_max[0] : 0;

        if (q.includes("umbrella") || q.includes("rain") || q.includes("wet")) {
            if (rainProb > 40 || [51,53,55,61,63,65,80,81,82,95].includes(current.weather_code)) {
                return `Yes, you should definitely carry an umbrella today! Precipitation probability is elevated at **${rainProb}%** with ${this.getConditionText(current.weather_code).toLowerCase()}.`;
            } else {
                return `An umbrella probably isn't needed right now! Rain probability for today in ${locationName} is relatively low at **${rainProb}%**.`;
            }
        }

        if (q.includes("wear") || q.includes("clothes") || q.includes("jacket") || q.includes("coat")) {
            const outfit = this.generateOutfitRecommendation(weatherData);
            return `For **${locationName}** right now (${temp}°C): We recommend wearing a **${outfit.top}** paired with **${outfit.bottom}**. Accessories: **${outfit.accessories}**.`;
        }

        if (q.includes("run") || q.includes("jog") || q.includes("exercise") || q.includes("walk")) {
            if (temp >= 10 && temp <= 22 && rainProb < 30 && wind < 20) {
                return `Great timing for outdoor exercise! The weather in ${locationName} is ideal (${temp}°C, gentle breeze of ${wind} km/h).`;
            } else {
                return `Outdoor workouts are manageable, but keep in mind current conditions: ${temp}°C temperature, ${wind} km/h wind, and ${rainProb}% chance of rain.`;
            }
        }

        if (q.includes("sun") || q.includes("uv") || q.includes("tan") || q.includes("sunscreen")) {
            return `The peak UV index today in ${locationName} is **${uvIndex}**. ${uvIndex >= 6 ? 'High UV protection is required! Apply SPF 30+ sunscreen and wear sunglasses.' : 'Moderate UV level. Enjoy the sun safely!'}`;
        }

        if (q.includes("wind") || q.includes("breeze")) {
            return `Wind speeds in ${locationName} are currently hovering around **${wind} km/h**. ${wind > 30 ? 'It is quite gusty today!' : 'Breeze is light to moderate.'}`;
        }

        // Generic intelligent answer fallback
        return `Based on live data for **${locationName}**, current temperature is **${temp}°C** with **${this.getConditionText(current.weather_code)}**. Humidity is at **${current.relative_humidity_2m}%** and wind speed is **${wind} km/h**. Feel free to ask specific questions about rain, outfits, exercise, or UV index!`;
    }
}
