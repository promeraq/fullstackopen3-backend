require("dotenv").config();
const mongoose = require("mongoose");

// MONGOOSE
mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connectiing to MongoDB:", error.message);
  });

// Definimos un esquema para una "person".
// Un esquema representa la estructura de los documentos dentro de una colección en MongoDB.
const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true },
  number: { type: String, minlength: 3, required: true },
});

// Definimos la transformación para cuando un documento de este esquema se convierta a JSON
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// "Person" is the singular name of the model. Mongoose will call the collection "persons"
module.exports = mongoose.model("Person", personSchema);
