const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const InitializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`dberror : ${e.message}`);
    process.exit(1);
  }
};
InitializeAndStartServer();

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todosList = `
        select *
        from todo
        where 
         id = ${todoId};
    `;
  const todos = await db.get(todosList);
  response.send(todos);
});

const hasPriorityAndStatus = (obj) => {
  return obj.status !== undefined && obj.priority !== undefined;
};

const hasStatus = (obj) => {
  return obj.status !== undefined;
};

const hasPriority = (obj) => {
  return obj.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodoDetails = "";
  let data = "";

  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodoDetails = `
             SELECT *
             FROM
             todo
             WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}'
              AND priority = '${priority}';`;

      break;
    case hasStatus(request.query):
      getTodoDetails = `
             SELECT *
             FROM
             todo
             WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}';`;

      break;
    case hasPriority(request.query):
      getTodoDetails = `
             SELECT *
             FROM
             todo
             WHERE
              todo LIKE '%${search_q}%'
              AND priority = '${priority}';`;

      break;
    default:
      getTodoDetails = `
             SELECT *
             FROM
             todo
             WHERE
              todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodoDetails);
  response.send(data);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  getTodoDetails = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES (
            ${id},
           '${todo}',
           '${priority}',
           '${status}'
        );
    `;

  data = await db.run(getTodoDetails);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const requestBody = request.body;
  const { todoId } = request.params;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const previousTodo = `
        SELECT *
        FROM todo
        WHERE 
         id = ${todoId}; `;
  const previousArray = await db.get(previousTodo);

  const {
    todo = previousArray.todo,
    priority = previousArray.priority,
    status = previousArray.status,
  } = request.body;

  const updateDetails = `
       UPDATE todo
       SET
         todo = '${todo}',
         priority = '${priority}',
         status = '${status}'
        WHERE 
           id = ${todoId};
    `;

  await database.run(updateDetails);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
        DELETE FROM 
        todo
        WHERE
        id = '${todoId}';`;

  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
