const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor(diff / oneDay);

  return dayOfYear;
}

function get_solar_declination_angle(dayOfYear) {
  return 23.44 * Math.sin((360 * (dayOfYear - 1)) / 365);
}

function getSolarHourAngle(hour) {
  const solarTime = hour + 12;
  return 15 * (solarTime - 12);
}

function getTiltAngle(solarHourAngle, solarDeclinationAngle, inputValue) {
  const inputValueRad = (Math.PI / 180) * inputValue;
  const solarDeclinationAngleRad = (Math.PI / 180) * solarDeclinationAngle;
  const solarHourAngleRad = (Math.PI / 180) * solarHourAngle;

  const elevation = Math.acos(
    Math.sin(inputValueRad) * Math.sin(solarDeclinationAngleRad) +
    Math.cos(inputValueRad) * Math.cos(solarDeclinationAngleRad) * Math.cos(solarHourAngleRad)
  );

  const elevationDegrees = (180 / Math.PI) * elevation;

  return elevationDegrees;
}

// Handle Integer Input
app.post('/calculate', (req, res) => {
  try {
    const inputValue = req.body.latitude;
    console.log(inputValue);

    const currentDate = new Date();
    const dayOfYear = getDayOfYear(currentDate);
    const solarDeclinationAngle = get_solar_declination_angle(dayOfYear);

    const result = {};

    for (let hour = 6; hour <= 18; hour++) {
      const solarHourAngle = getSolarHourAngle(hour);
      result[hour] = getTiltAngle(solarHourAngle, solarDeclinationAngle, inputValue);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in /calculate:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
