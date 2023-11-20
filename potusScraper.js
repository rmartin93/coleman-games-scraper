const rp = require("request-promise");
const url =
	"https://www.maxpreps.com/tx/coleman/coleman-bluecats/basketball/schedule/";
const cheerio = require("cheerio");

rp(url)
	.then(function (html) {
		//success!
		const $ = cheerio.load(html);
		console.log("success!");
		// Turn each row into an object
		const games = [];
		$("tbody tr").each((i, elem) => {
			const hat = $(elem).find("td:nth-child(2) span.hat").text();
			let away = true;
			if (hat === "vs") away = false;
			games.push({
				date: $(elem).find("td:nth-child(1)").text(),
				opponent: $(elem).find("td:nth-child(2) span.name").text(),
				opponentLogo: $(elem).find("td:nth-child(2) img").attr("src"),
				time: $(elem).find("td:nth-child(3)").text(),
				location: away ? "Away" : "Home",
			});
		});
		console.log("games", games);
	})
	.catch(function (err) {
		//handle error
	});
