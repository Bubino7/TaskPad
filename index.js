import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
// const port = 3000;
const port = process.env.PORT || 4000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "TaskPad",
    password: 'éžé+íí',
    port: 5432,
});

db.connect();

let users = [];
let tasks = [];


app.use(bodyParser.urlencoded( {extended: true} ));
app.use(express.static("public"));


//home route
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM tasks ORDER BY timeofcreation ASC;");
    tasks = result.rows;

    console.log(tasks);

    res.render("main.ejs", {
        tasks: tasks,
    });
});

//Task creation route
app.post("/createTask", async (req, res) => {
    const taskInput = req.body.task;
    const taskNote = req.body.taskNotes;
    const taskUser = req.body.taskUser;
    const currentTime = new Date().toLocaleString();
    const ids = [];

    const result = await db.query("SELECT taskId FROM tasks ORDER BY taskId ASC ");
    result.rows.forEach((id) => {
        ids.push(id);
    });

    function randomNum (max) {
        let randomNum = Math.floor(Math.random() * max);

        while ( ids.includes(randomNum) === false ) {
            return randomNum;
        }
    };

    const newId = randomNum(10000);

    try {
        await db.query(
            "INSERT INTO tasks (taskId, task, userName, timeOfCreation, notes) VALUES ($1, $2, $3, $4, $5)",
            [newId, taskInput, taskUser, currentTime, taskNote],
        );

        console.log(newId);
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }

    console.log(taskInput);
    console.log(taskNote);
    console.log(taskUser);
    console.log(currentTime);
});

//Task editing route
app.post("/editTask", async (req, res) => {
    const taskId = req.body.taskId;
    const taskInput = req.body.task;
    const taskNote = req.body.taskNotes;
    const taskUser = req.body.taskUser;
    const currentTime = new Date().toLocaleString();
    const edited = true;

    try {
        await db.query(
            "UPDATE tasks SET (task, timeofedit, edited, notes) = ($1, $2, $4, $5) WHERE taskid = $3",
            [taskInput, currentTime, taskId, edited, taskNote]
        );

        console.log(taskId);

        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

//Task deleting route
app.post("/deleteTask", async (req, res) => {
    const taskId = req.body.deletingTaskId;

    try {
        await db.query(
            "DELETE FROM tasks WHERE taskid = $1",
            [taskId]
        );

        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log("The server is running on http://localhost:" + (port) + ".");
});
