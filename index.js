require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const PORT = process.env.PORT;
const app = express();

app.use(cors());
// To connect with the frontend (dist is generated with npm run build)
app.use(express.static("dist"));
// json-parser
app.use(express.json());

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
// Response in terminal :method :url :status :res[content-length] - :response-time ms

app.use(morgan("custom"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      return response.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

const generateId = () => {
  const id = Math.floor(Math.random(0, 9) * 1000);
  return id;
};

app.post("/api/persons", async (request, response) => {
  const { name, number } = request.body;
  if (await Person.exists({ name })) {
    return response.status(400).json({ error: "name must be unique" });
  } else if (name === undefined) {
    return response.status(400).json({ error: "name missing" });
  } else if (number === undefined) {
    return response.status(400).json({ error: "number missing" });
  }

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((savedPerson) => response.json(savedPerson));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  Person.find({}).then((result) => {
    const numPeople = result.length;
    var date = new Date().toLocaleString();
    response.send(
      `<p>Phonebook has info for ${numPeople} people</p><p>${date}</p>`
    );
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

// Assign http server to app variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
