import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    username: {type: String, required: true},
    password: {type: String, required: true},
    // email: {type: String, required: true},
});

// define the data in our collection
const PetSchema = new mongoose.Schema({
    name: {type: String, required: true},
    animal: {type: String, required: true}, 
    age: {type: Number, required: true},
    location: {type: String, required: true},
    breed: {type: String, required: true},
    gender: {type: String, required: true},
    canFoster: {type: Boolean, required: true},
    qualities: {type: Array, required: false},
    image: {type: String, required: true},  
    owner: {type: String, required: false}
});

mongoose.model('User', UserSchema);
mongoose.model('Pet', PetSchema);
console.log("process.env.DSN: "+process.env.DSN);
mongoose.connect(process.env.DSN);

//// db.pets.remove({name: "Teddy", animal: "dog", age: "3", location: "Seattle", breed: "golden doodle", gender: "boy", canFoster: true, qualities: [{favorite_activity: "fetch"}, {object: "collar", color: "green"}]})

// db.pets.insertOne({name: "Teddy", animal: "dog", age: "3", location: "Seattle", breed: "golden doodle", gender: "boy", canFoster: true, qualities: [{favorite_activity: "fetch"}, {object: "collar", color: "green"}], image: "/images/teddy.jpeg" })

// db.pets.remove({name: "Luca", animal: "fish", age: 1, location: "New York", breed: "goldfish", gender: "boy", canFoster: true, qualities: [{favorite_activity: "tag"}]})
// db.pets.insertOne({name: "Luca", animal: "fish", age: 1, location: "New York", breed: "goldfish", gender: "boy", canFoster: true, qualities: [{favorite_activity: "tag"}], image: "/images/luca.jpeg" })

// db.pets.remove({name: "Bowie", animal: "dog", age: 2, location: "New York", breed: "german shepherd", gender: "boy", canFoster: true, qualities: [{favorite_food: "bananas"}, {nickname: "Faro"}]})
// db.pets.insertOne({name: "Bowie", animal: "dog", age: 2, location: "New York", breed: "german shepherd", gender: "boy", canFoster: true, qualities: [{favorite_food: "bananas"}, {nickname: "Faro"}], image: "/images/bowie.png"})