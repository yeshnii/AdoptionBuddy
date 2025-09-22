import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';


const User = mongoose.model('User');
const salt = bcrypt.genSaltSync(10);


const startAuthenticatedSession = (req, user) => {
  return new Promise((fulfill, reject) => {
    req.session.regenerate((err) => {
      if (!err) {
        req.session.user = user; 
        fulfill(user);
      } else {
        reject(error);
      }
    });
  });
};

const endAuthenticatedSession = req => {
  return new Promise((fulfill, reject) => {
    req.session.destroy(err => err ? reject(err) : fulfill(null));
  });
};

const register = (username, password) => {
  return new Promise(async (fulfill, reject) => {

    if(username.length > 8 && password.length > 8){ 

        const existing = await User.findOne({username: username});

        if(existing != null) {
          reject('USERNAME ALREADY EXISTS');
        }else {
          const hash = bcrypt.hashSync(password, salt);
          const newUser = new User({ 
            _id: new mongoose.Types.ObjectId(),
            username: username, 
            password: hash
          });
          

          const saved = await newUser.save(); //save(), find(), and findOne() are all async
          fulfill(saved);
        }


    }else{
      reject('USERNAME PASSWORD TOO SHORT');
    }
    
  });
}











const login = (username, password) => {
  return new Promise(async (fulfill, reject) => {

    
    const existing = await User.findOne({username:username});
    if(existing){
      const samePassword = bcrypt.compareSync(password, existing.password);
      if(samePassword){
        fulfill(existing);
      }else {
        console.log(existing.password);
        console.log(samePassword);
        reject("PASSWORDS DO NOT MATCH");
      }
    }else {
      reject("USER NOT FOUND");
    }


  });
};

export  {
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login
};
