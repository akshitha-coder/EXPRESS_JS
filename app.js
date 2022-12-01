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
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray); //sending response
});

//Add a Player
