const express = require("express"); //importing express package
const path = require("path"); //importing path

const app = express(); //server instance

const { open } = require("sqlite"); //importing open object from sqlite package which is used to connect db server and provides a connection object to operate on database
const sqlite3 = require("sqlite3"); //importing sqlite3 package

app.use(express.json()); //is used to recognize that the incoming object is JSON object and parses it

const dbPath = (__dirname, "cricketTeam.db"); //__dirname is a variable in common JS modules where path of the directory where the current file is present

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000");
    }); //server listens to 3000 port in the localhost
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1); //stops the process if any error occurs
  }
};

initializeDbAndServer(); // calling the async function

//Get players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;
    `;
  const dbObject = await db.all(getPlayersQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  const arr = [];
  for (let each of dbObject) {
    const a = convertDbObjectToResponseObject(each);
    arr.push(a);
  }
  response.send(arr);
});

//Add a Player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const playerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},    
        '${role}'
    );`;
  const dbResponse = await db.run(playerQuery);
  const playerId = dbResponse.lastID;

  response.send("Player Added to Team");
});

// Get a Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  const playerDetails = await db.get(playerQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const ans = convertDbObjectToResponseObject(playerDetails);

  response.send(ans);
});

//Update a Player

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const playerQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};
    `;

  const dbResponse = await db.run(playerQuery);
  response.send("Player Details Updated");
});

//Delete a player

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    DELETE FROm cricket_team
    WHERE player_id = ${playerId};
    `;

  await db.run(playerQuery);
  response.send("Player Removed");
});

module.exports = app;
