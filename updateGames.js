const sql = require("./db");

async function updateGames(games) {
	// Use map to create an array of promises
	const promises = games.map(async (game) => {
		const queryString = `
            call gameScratchInsert(
                'system',
                'varsity',
                'men',
                '${game.date}',
                '${game.time}',
                '${game.teamMe}',
                '${game.opponent}',
                '${game.opponentLogo}',
                '${game.opponentUrl}',
                ${game.location === "Home" ? 1 : 0},
                ${game.teamMeScore},
                ${game.teamOpponentScore}
            );
        `;
		try {
			// Run your query
			let results = await sql.query(queryString);

			// You may want to log the results here if needed
			return results._results;
		} catch (error) {
			// Handle the error
			console.error("Error executing SQL query:", error);
			throw error; // Rethrow the error to indicate failure
		}
	});

	// Use Promise.all to wait for all promises to resolve
	return Promise.all(promises);
}

module.exports = updateGames;

// CREATE PROCEDURE `gameScratchInsert`(
// 	   p_userId				varchar(30),
//     p_competitionLevel		varchar(45),
//     p_gender    			varchar(45),
//     p_gameDate    			DATE,
//     p_gameTime				TIME,
//     p_teamMe				varchar(100),
//     p_teamOpponent			varchar(100),
//     p_teamOpponentLogo		varchar(200),
//     p_home					INT,
//     p_teamMeScore			decimal(8,2),
//     p_teamOpponentScore		decimal(8,2)
// )
// BEGIN
// 	declare l_teamHome 		varchar(100);
//     declare l_teamAway 		varchar(100);
//     declare l_teamHomeLogo 	varchar(200);
//     declare l_teamAwayLogo 	varchar(200);
//     declare l_teamMeLogo	varchar(200);
//     declare l_teamHomeScore decimal(8,2);
//     declare l_teamAwayScore decimal(8,2);

//     if (p_home = 1) then
// 		set l_teamHome = p_teamMe;
//         set l_teamAway = p_teamOpponent;
// 		set l_teamHomeLogo = '';
//         set l_teamAwayLogo = p_teamOpponentLogo;
//         set l_teamHomeScore = p_teamMeScore;
//         set l_teamAwayScore = p_teamOpponentScore;
// 	else
// 		set l_teamHome = p_teamOpponent;
//         set l_teamAway = p_teamMe;
// 		set l_teamHomeLogo = p_teamOpponentLogo;
//         set l_teamAwayLogo = '';
//         set l_teamHomeScore = p_teamOpponentScore;
//         set l_teamAwayScore = p_teamMeScore;
//     end if;
// 	if not exists (
// 		select 1 from gameScratch
//         where competitionLevel = p_competitionLevel
//         and gender = p_gender
//         and gameDate = p_gameDate
//         and teamHome = l_teamHome
//         and teamAway = l_teamAway
// 	) then
// 		insert into gameScratch (
// 			competitionLevel, gender, gameDate, gameTime,
//             teamHome, teamAway, teamHomeLogo, teamAwayLogo,
//             teamHomeScore, teamAwayScore,
//             createdBy, updatedBy
// 		) values (
// 			p_competitionLevel, p_gender, p_gameDate, p_gameTime,
//             l_teamHome, l_teamAway, l_teamHomeLogo, l_teamAwayLogo,
//             l_teamHomeScore, l_teamAwayScore,
//             p_userId, p_userId
// 		);
// 	else
// 		update gameScratch
//         set teamHomeLogo = l_teamHomeLogo,
//         teamAwayLogo = l_teamAwayLogo,
//         teamHomeScore = l_teamHomeScore,
//         teamAwayScore = l_teamAwayScore
//         where competitionLevel = p_competitionLevel
//         and gender = p_gender
//         and gameDate = p_gameDate
//         and gameTime = p_gameTime
//         and teamHome = l_teamHome
//         and teamAway = l_teamAway;
//     end if;
// END$$
// DELIMITER ;
// call `gameScratchInsert`(
// 	'system', 'varsity', 'men', '2022-11-11', '19:30',
//     'Mayberry', 'Gotham', 'xxx', 1, 0, 0
// );

// select * from gameScratch;
// -- truncate table gameScratch;
