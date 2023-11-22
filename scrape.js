const rp = require("request-promise");

const cheerio = require("cheerio");
const updateGames = require("./updateGames");
const getNextTeam = require("./getNextTeam");
const teamCompleted = require("./teamCompleted");

const scrapeGames = async (url) =>
	rp(url)
		.then(function (html) {
			const $ = cheerio.load(html);

			let teamMe = $(html).find("h1").text();
			// teamMe needs to be the first word in the h1; the h1 could have many words in it
			teamMe = teamMe.split(" ")[0];
			// Escape any single quotes in teamMe
			teamMe = teamMe.replace(/'/g, "\\'");

			// Turn each row into an object
			const games = [];
			$("tbody tr").each((i, elem) => {
				const hat = $(elem).find("td:nth-child(2) span.hat").text();
				let away = true;
				if (hat === "vs") away = false;
				const winLoss = $(elem).find(".result .w-l-t").text();
				const score = $(elem).find(".result .score").text();
				const { teamMeScore, teamOpponentScore } = formatScore(winLoss, score);
				// Check if parent thead has Time column
				const timeColumn = $(elem)
					.parent()
					.parent()
					.find("thead tr th:nth-child(3)")
					.text();
				const hasTimeColumn = timeColumn === "Time";
				games.push({
					date: $(elem).find("td:nth-child(1)").text(),
					teamMe: teamMe,
					opponent: $(elem)
						.find("td:nth-child(2) span.name")
						.text()
						.replace(/'/g, "\\'"),
					opponentLogo: $(elem).find("td:nth-child(2) img").attr("src"),
					opponentUrl: $(elem).find("td > a").attr("href") + "schedule",
					time: hasTimeColumn
						? $(elem).find("td:nth-child(3)").text()
						: "7:00pm",
					location: away ? "Away" : "Home",
					teamMeScore: teamMeScore || 0,
					teamOpponentScore: teamOpponentScore || 0,
				});
			});
			return { games };
		})
		.catch(function (err) {
			// handle error
			console.log("scrapeGames error: ", err);
			return { games: [] };
		});

const formatScore = (winLoss, score) => {
	// Sometimes score will have things like (OT), (FF), (20T), etc.
	// Detect an opening parenthesis and remove it and everything after it up to a closing parenthesis
	score = score.replace(/\(.*/, "");
	if (score === "(FF)") {
		if (winLoss === "W") {
			return { teamMeScore: 2, teamOpponentScore: 0 };
		} else {
			return { teamMeScore: 0, teamOpponentScore: 2 };
		}
	}
	let teamMeScore = winLoss === "W" ? score.split("-")[0] : score.split("-")[1];
	let teamOpponentScore =
		winLoss === "W" ? score.split("-")[1] : score.split("-")[0];
	return { teamMeScore, teamOpponentScore };
};

const formatGames = (games) => {
	// Games are coming back in month/day format...
	// If a game is is in november or december, the year is the current year
	// If a game is in any other month, the year is the next year
	// Times are in 6:30pm format, and need to be converted to 18:30:00
	const res = games.map((game) => {
		const date = game.date.split("/");
		const month = date[0];
		const day = date[1];
		const year =
			month > 10 ? new Date().getFullYear() : new Date().getFullYear() + 1;
		const newDate = `${year}-${month}-${day}`;
		if (game.time === "Time TBA")
			return { ...game, date: newDate, time: "19:00:00" };
		const time = game.time.split(":");
		const hour = time[0];
		const minute = time[1].slice(0, 2);
		const ampm = time[1].slice(2);
		const newHour = ampm === "pm" ? parseInt(hour) + 12 : hour;
		const newTime = `${newHour}:${minute}:00`;
		return { ...game, date: newDate, time: newTime };
	});
	return res;
};

const getNextTeamPromise = () => {
	return new Promise((resolve, reject) => {
		getNextTeam((err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
};

const index = async () => {
	let keepGoing = true;

	async function processTeam() {
		try {
			const rows = await getNextTeamPromise();

			if (rows.length === 0) {
				keepGoing = false;
				console.log("Done!");
			} else {
				console.log("rows[0].teamName: ", rows[0].teamName);
				const { games } = await scrapeGames(rows[0].scheduleUrl);
				const formattedGames = formatGames(games);
				await updateGames(formattedGames);
				const escapedTeamName = rows[0].teamName.replace(/'/g, "\\'");
				await teamCompleted(escapedTeamName);

				// Process the next team
				if (keepGoing) {
					setImmediate(processTeam);
				}
			}
		} catch (error) {
			console.error("Error processing team:", error);
		}
	}

	processTeam();
};

index();
