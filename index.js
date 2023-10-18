const express = require("express");
var morgan = require("morgan");
const cors = require("cors");

const app = express();

let persons = [
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
];

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
    result += ` ${JSON.stringify(req.body.content)}`;
  }

  return result;
});

// To connect with the frontend (dist is generated with npm run build)
app.use(express.static("dist"));
app.use(cors());
// json-parser
app.use(express.json());
app.use(morgan("tiny"));
// Respuesta morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(morgan("custom"));

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    // end() envía una respuesta sin datos
    response.status(404).end();
  }
});

const generateId = () => {
  const id = Math.floor(Math.random(0, 9) * 1000);
  return id;
};

app.post("/api/persons", (request, response) => {
  const id = generateId();
  const body = request.body;
  const found = persons.find((person) => person.name === body.content.name);
  if (!body.content.name || !body.content.number) {
    return response.status(400).json({
      error: "name or phone are missing",
    });
  } else if (found) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.content.name,
    number: body.content.number,
  };

  persons = persons.concat(person);

  response.json(persons);
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
