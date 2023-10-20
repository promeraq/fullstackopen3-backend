const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
/* const name = process.argv[3];
const number = process.argv[4];
 */
const url = `mongodb+srv://promera:${password}@cluster0.ht0afxh.mongodb.net/phoneBook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

// Define schema of a person that's stored in a variable
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// "Person" is the singular name of the model. Mongoose will call the collection "persons"
const Person = mongoose.model("Person", personSchema);

// Create a new object
const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

if (process.argv.length > 3) {
  person.save().then((result) => {
    console.log("person saved!");
    mongoose.connection.close();
  });
}

Person.find({}).then((result) => {
  console.log("phonebook:");
  result.forEach((person) => {
    console.log(person.name, person.number);
  });
  mongoose.connection.close();
});
