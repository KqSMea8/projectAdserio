const express = require('express')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
var  mysql = require('mysql');


const User = require('../models/User')
const Candidats = require('../models/Candidats')

//Database connection
var mysqlConn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'adservio'
});
mysqlConn.connect((err)=>{
  if(!err)
      console.log("okkkkkkkkkkkkkkkkkkkkk");
  else
      console.log("errrrrrreur "+JSON.stringify(err,undefined,2));
});

users.use(cors())

process.env.SECRET_KEY = 'secret'

users.post('/register', (req, res) => {
  const today = new Date()
  const userData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    created: today
  }

  User.findOne({
    where: {
      email: req.body.email
    }
  })
    //TODO bcrypt
    .then(user => {
      if (!user) {
        User.create(userData)
          .then(user => {
            let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
              expiresIn: 1440
            })
            res.json({ token: token })
          })
          .catch(err => {
            res.send('error: ' + err)
          })
      } else {
        res.json({ error: 'User already exists' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

users.post('/login', (req, res) => {
  console.log("je suis icccccccccccccccccci")
  User.findOne({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  })
    .then(user => {
      if (user) {
        let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
          expiresIn: 1440
        })
        res.json({ token: token })
      } else {
        res.send('User does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

users.get('/profile', (req, res) => {
  var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
  console.log(decoded.id)
  User.findOne({
    where: {
      id: decoded.id
    }
  })
    .then(user => {
      if (user) {
        res.json(user)
      } else {
        res.send('User does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})
//get All candidats
users.get('/getAllCandidat',function (req,res) {
  Candidats.findAll({}).then(candidats => {
      if (candidats) {
        res.json(candidats)
      } else {
        res.send('candidats does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
});
//get candidat
users.get('/getCandidatById/:id', function(req, res, next) {
    Candidats. User.findOne({
      where: {
        id: req.body.id
      }
    })
    .then(candidats => {
      if (candidats) {
        res.json(candidats)
      } else {
        res.send('candidat does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
});
/* add et update candidat*/
users.post('/addCandidat', (req, res) => {
  var condition = { where :{id: req.body.id} }; 
  options = { multi: true };
  const candidatData = {
     id : req.body.id,
     nom : req.body.nom,
     prenom : req.body.prenom,
     dateEmbouche: req.body.dateEmbouche,
     dateValidCrtSejour : req.body.dateValidCrtSejour,
     postOcupe :req.body.postOcupe,
  }
      if(req.body.id!=null){
          Candidats.update(candidatData,condition,options)
          .then(user => {
            res.json(user)
          })
          .catch(err => {
            res.send('error: ' + err)
          })
      }else{
          Candidats.create(candidatData)
          .then(user => {
            res.json(user)
          })
          .catch(err => {
            res.send('error: ' + err)
        })
      }
      
    })
  /* update etat candidat*/
users.put('/modifEtatCandidat', (req, res) => {
  var condition = { where :{id: req.body.id} }; 
  options = { multi: true };
  const candidatData = {
     dateEmbouche: req.body.dateEmbouche,
     visiteMedical : req.body.visiteMedical,
     postOcupe :req.body.postOcupe,
     commentaire:req.body.commentaire,
     entretienIndividuel:req.body.entretienIndividuel,
  }
      if(req.body.id!=null){
          Candidats.update(candidatData,condition,options)
          .then(user => {
            res.json(user)
          })
          .catch(err => {
            res.send('error: ' + err)
          })
      } 
    })
    /* update etat candidat*/
users.delete('/deleteCandidat/:id', (req, res) => {
  mysqlConn.query('delete from candidats where id=? ',[req.params.id], function (error, results, fields) {
      if (error) throw error;
      res.send("deleted successeful");
  });
   });
users.get("/verifDateValidEmb",function(req,res){

    mysqlConn.query('select * from candidats where (SELECT TIMESTAMPDIFF(DAY, dateEmbouche,NOW()) as dateEmbouche)>105', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})
//count period d'essai
users.get("/countPerEssai",function(req,res){

    mysqlConn.query('select *  from candidats where (SELECT TIMESTAMPDIFF(DAY,dateEmbouche,NOW()) as dateEmbouche)>=105', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})
//count carte sejour
users.get("/countValCarteSej",function(req,res){

    mysqlConn.query('select * from candidats where   (SELECT TIMESTAMPDIFF(DAY,NOW(),dateValidCrtSejour))>=60 and (SELECT TIMESTAMPDIFF(DAY,NOW(),dateValidCrtSejour))<=70', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})
//count dateEntrAnnuel
users.get("/dateEntrAnnuel",function(req,res){

    mysqlConn.query('select * from candidats where (SELECT TIMESTAMPDIFF(MONTH,dateEmbouche,NOW())as dateEmbouche)>=9 and entretienIndividuel=0', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})


module.exports = users
