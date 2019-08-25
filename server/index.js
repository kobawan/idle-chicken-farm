require("dotenv").config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Creating express app
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());

// Serving client
app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname, '..', 'build', "index.html"));
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
