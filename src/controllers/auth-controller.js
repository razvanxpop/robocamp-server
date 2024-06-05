import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//const crypto = require('crypto');
//const nodemailer = require('nodemailer');

import xss from 'xss';
import database from '../config/database.js';

//! TODO - FILL THE CORECT DATA IN THE TRANSPORTER LINE 59 AT REGISTER
//! WRITE IN THE DOTENV FILE, MY EMAIL, MY PASSWORD, AND THE HOST AND PORT OF THE EMAIL SERVICE
//! REPLACE LINKS WITH DOTENV VARIABLES
//! MAKE THE USER MODULE
//! MAKE THE EMAIL SERVICE
//! CODE REFACTORING AND CLEANING
// ! check database again

export const verifyJWT = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    res.status(403).json({ message: 'No token provided' });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        res.status(403).json({auth: false, message: 'Failed to authenticate token' });
      } else {
        req.userId = decoded.id;
        await database('users').update('is_verified', true).where('id', decoded.id);
        next();
      }
    });
  }
};
export const register = async (req, res) => {
  const username = req.body.username !== undefined ? xss(req.body.username) : undefined;
  const email = req.body.email !== undefined ? xss(req.body.email) : undefined;
  const password = req.body.password !== undefined ? xss(req.body.password) : undefined;

  try {
    let found = await database('users').count('*').where('email', email).then(result => result[0].count > 0);
    if(!found){
      found = await database('users').count('*').where('username', username).then(result => result[0].count > 0);
    }

    if (found) {
      return res.status(400).json({ message: 'Username or email already in use!' });
    }

    const salt = await bcrypt.genSalt(10);

    await bcrypt.hash(password, salt, async (err, hash) => {
      if(err){
        console.error(err.message);
        res.status(500).send('Server error');
      }
      await database('users').insert({
        username: username,
        email: email,
        password: hash,
      });

      res.status(201).json({ message: 'User registered' });
    });

    //const [userId] = await database('users').insert(user).returning('id');

    // const mailOptions = {
    //   from: process.env.EMAIL,
    //   to: email,
    //   subject: 'Verify your email',
    //   text: `Click on the link to verify your email: http://localhost:3000/verify-email?token=${token}`
    // };

    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.example.com',
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: 'razvanpop03@gmail.com', // your SMTP username
    //     pass: 'your-password' // your SMTP password
    //   }
    // });
    // transporter.sendMail(mailOptions, (err, info) => {
    //   console.log(err);
    // });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const username = req.body.username !== undefined ? xss(req.body.username) : undefined;
  const password = req.body.password !== undefined ? xss(req.body.password) : undefined;

  try {
    const user = await database('users').select('*').where('username', username).then(data => data[0]);
    
    if (!user) {
      return res.status(400).json({auth: false, message: 'User does not exist.' });
    }

    bcrypt.compare(password, user.password, (error, response) => {
      if(response){
        const id = user.id;
        const token = jwt.sign({id}, process.env.JWT_SECRET, {
          expiresIn: 300,
        });
        res.status(200).json({auth: true, token: token, result: user.id});
      } else {
        res.status(200).json({auth: false, message: "Invalid credentials"});
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const verify = async (req, res) => {
  try{
    const token = req.body.token !== undefined ? xss(req.body.token) : undefined;

    const user = await database('users').select('*').where('validationToken', token).first();

    if(!user){
      return res.status(400).json({ message: 'Invalid token'});
    }
    //user.isVerified = true;
    await database('users').where('id', user.id).update('isVerified', true);

    res.status(201).json({ message: 'Account verified' });
  } catch (err){
    console.error(err.message);
    res.status(500).send('Server error');
  } 
}