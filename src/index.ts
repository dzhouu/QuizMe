import express, { Express } from "express";
import bodyParser from 'body-parser';
import {save, lists, load, clear, saveScore, listScores, clearScores} from "./routes";


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/lists", lists)
app.get("/api/load", load)
app.get("/api/clear", clear);
app.post("/api/save", save);
app.post("/api/saveScore", saveScore);
app.get("/api/listScores", listScores);
app.get("/api/clearScore", clearScores);
app.listen(port, () => console.log(`Server listening on ${port}`));
