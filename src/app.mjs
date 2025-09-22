import './config.mjs'

import express from 'express';
import session from 'express-session';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import './db.mjs';
import * as auth from './auth.mjs';

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: "sk-proj-o4bDXW26Ci4MQnpw784pT3BlbkFJ60XV0gxG3UYPrdGtgWC4" });

//ref: hw5
const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

let thisUser = "";


import fs from "fs";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);

const upload = multer(multer.memoryStorage())
const Pet = mongoose.model('Pet');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

const authRequiredPaths = ['/add', '/mypets', '/'];
app.use((req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
        if (!req.session.user)  {
        res.redirect('/login'); 
      } else {
        next(); 
      }
    } else {
      next(); 
    }
  });



app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
  });
  
app.use((req, res, next) => {
console.log(req.path.toUpperCase(), req.body);
next();
});


app.use((req, res, next) => {
    console.log("Method: ", req.method, "\n Path: ", req.path, "\n Body:", JSON.stringify(req.body), "\n Query: ", JSON.stringify(req.query) + "\n");
    next();
})



app.get("/", async (req, res) => {
    try {
        const result = await Pet.find();
        result.forEach(p=> {console.log('p.hasOwnProperty("owner"): ', p.name, p.hasOwnProperty("owner"), p.owner)});
        
        const notAdopted = result.filter(p => p.owner===undefined);
        
        
        notAdopted.forEach(pet => {pet.image=pet.image.replace("/public", "")});
        res.render('index', { pets: notAdopted });
    } catch (e) {
        res.status(500).send('server error');
    }

});

app.post("/", async (req, res) => {
    const foundPet = await Pet.find({name: req.body.pet_name, animal: req.body.pet_animal, breed: req.body.pet_breed, location: req.body.pet_location});
    await Pet.updateOne({name: req.body.pet_name, animal: req.body.pet_animal, breed: req.body.pet_breed, location: req.body.pet_location}, {$set: {owner: thisUser}}).then(() => res.redirect('/'))
    .catch(err => {
        // Handle errors
        console.error("Error adopting pet:", err);
        res.status(500).send('Server error');
    });

})

app.get("/tailored", (req, res) => {
    res.render('tailoredsearch', {});

});

app.post("/tailored", async (req, res) => {
    try {
        console.log("Received form data:", req.body);

        let ans;
        if (req.body.animal && req.body.animal.length > 0) {
            if (req.body.breed && req.body.breed.length > 0) {
                if (req.body.gender && req.body.gender.length > 0) {
                    console.log(":)", "1");
                    ans = await Pet.find({ animal: req.body.animal, breed: req.body.breed, gender: req.body.gender });
                } else {
                    console.log(":)", "2");
                    ans = await Pet.find({ animal: req.body.animal, breed: req.body.breed });
                }
            } else {
                console.log(":)", "3");
                ans = await Pet.find({ animal: req.body.animal });
            }
        } else {
            if (req.body.breed && req.body.breed.length > 0) {
                if (req.body.gender && req.body.gender.length > 0) {
                    console.log(":)", "4");
                    ans = await Pet.find({ breed: req.body.breed, gender: req.body.gender });
                } else {
                    console.log(":)", "5");
                    ans = await Pet.find({ breed: req.body.breed });
                }
            } else {
                console.log(":)", "6");
                ans = await Pet.find();
            }
        }

        console.log("Search results:", ans);
        ans.forEach(pet => {pet.image=pet.image.replace("/public", "")});
        res.render('index', { pets: ans });
    } catch (e) {
        console.error("Error in tailored search:", e);
        res.status(500).send('server error');
    }
});

app.get("/add", (req, res) => {
    res.render('add');

});


app.get("/julie", (req, res) => {
    res.render('julie', {});

});

app.post("/julie", async (req, res) => {
    console.log(req.body["userInput"]);
    // res.send(req.body["userInput"]);
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are Julie, an AI professional veterinarian who attended top medical schools and has two dogs in her house, and has a personality of Zendaya. " }, { role: "user", content: req.body["userInput"] }],
        model: "gpt-3.5-turbo",
    });
    console.log(completion.choices[0].message.content);
    res.render('julie', { body: completion.choices[0].message.content });
    // res.redirect("/julie");
});

app.post("/add", upload.single('image-file'), async (req, res) => {


    console.log("req.file", req.file.buffer);

    console.log("session.user: "+session.user);
    if(session.user){
        res.redirect("/login");
    }

    console.log("__dirname ", __dirname);
    const savePath = "/public/images/" + req.file.originalname,
          writePath = `${__dirname}/${savePath}`;

    await fs.writeFileSync(writePath, req.file.buffer);

    const newPet = new Pet({ 
        name: req.body.name, 
        animal: req.body.animal, 
        age: req.body.age, 
        location: req.body.location, 
        breed: req.body.breed, 
        gender: req.body.gender, 
        canFoster: req.body.canFoster === "true", 
        image: savePath });

    console.log("newPet: ", newPet);
    console.log("newPet.image: ", newPet.image);
    newPet.save().then(savedPet => res.redirect('/'))
        .catch(err => {
            // Handle errors
            console.error("Error saving new pet:", err);
            res.status(500).send('Server error');
        });

});



app.get('/register', (req, res) => {
    res.render('register');
  });
  
app.post('/register', async (req, res) => {
try {
    const newUser = await auth.register(
    sanitize(req.body.username), 
    sanitize(req.body.password)
    );
    thisUser=req.body.username;
    await auth.startAuthenticatedSession(req, newUser);
    res.redirect('/'); 
} catch(err) {
    console.log(err);
    res.render('register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
}
});


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const user = await auth.login(
      sanitize(req.body.username), 
      sanitize(req.body.password)
    );
    thisUser=req.body.username;
    await auth.startAuthenticatedSession(req, user);
    res.redirect('/'); 
  } catch(err) {
    console.log(err)
    res.render('login', {message: loginMessages[err.message] ?? 'Login unsuccessful'}); 
  }
});

app.get("/mypets", async (req, res)=> {
    const result = await Pet.find();
    result.forEach(pet => {pet.image=pet.image.replace("/public", "")});
    const myPets = await result.filter(p => p.owner=== thisUser);
    
    console.log("myPets.length: "+ myPets.length);
    res.render("mypets", {pets: myPets, username: thisUser});
    
})



app.listen(process.env.PORT ?? 3000);
