require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(cors());
// To connect with the frontend (dist is generated with npm run build)
app.use(express.static("dist"));
// json-parser
app.use(express.json());

const PORT = process.env.PORT;

/* let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "210-123456",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "041-123666",
  },
  {
    id: 4,
    name: "Mary Popplendich",
    number: "051-123556",
  },
]; */

// morgan.format("custom", function)
morgan.format("custom", (tokens, req, res) => {
  let result = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");

  // Si es una solicitud POST, añade el cuerpo de la respuesta
  if (req.method === "POST" && req.body) {
    result += ` ${JSON.stringify(req.body)}`;
  }

  return result;
});

app.use(morgan("tiny"));
// Respuesta morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(morgan("custom"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (!person) {
      return response.status(404).end();
    }
    return response.json(person);
  });
});

const generateId = () => {
  const id = Math.floor(Math.random(0, 9) * 1000);
  return id;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log("body", body);
  /*   const found = persons.find((person) => person.name === body.name);

  if (found) {
    return response.status(400).json({
      error: "name must be unique",
    });
  } */ /* else if ((body && !body.name) || !body.number) {
    return response.status(404).json({
      error: "name or phone are missing",
    });
  } */

  if (body.name === undefined) {
    return response.status(400).json({ error: "name missing" });
  } else if (body.number === undefined) {
    return response.status(400).json({ error: "number missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  /* persons = persons.concat(person); */
  /*   response.json(persons); */

  person.save().then((savedPerson) => response.json(savedPerson));
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.get("/info", (request, response) => {
  const numPeople = persons.length;
  var date = new Date().toLocaleString();
  response.send(
    `<p>Phonebook has info for ${numPeople} people</p><p>${date}</p>`
  );
});

// Assign http server to app variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
