var mongo = require('mongodb');
const express = require('express')
const http = require('http');
const { response } = require('express');
const port = process.env.PORT
const app = express()
const jwt = require('jsonwebtoken');
const { verify } = require('crypto');

const SECRET = 'ALESSANDRO'
app.use(express.json());

var MongoClient = require('mongodb').MongoClient;
var DATABASE_URL  = "mongodb+srv://godinis22:36731249@teste.sncrx1j.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(DATABASE_URL)
var dbo = client.db("usuario") 

app.get('/usuarios',verifyJWT, (req,response) => {
   
    const login = dbo.collection("login").find({}).toArray().then((data => {
        response.json(data)
        
    }))
     
})

app.get('/usuario/:id',verifyJWT, (req,response) => {
    console.log(req.params.id)
    const login = dbo.collection("login").findOne({_id: parseInt(req.params.id)}).then((data => {
        response.json(data)     
    }))     
})

app.delete('/usuario/:id',(req,response) => {
    console.log(req.params.id)
   
    const login = dbo.collection("login").deleteOne({_id: parseInt(req.params.id)}).then((data => {
        response.json({msg:"apagado com sucesso"})      
    }))     
})

app.put('/usuario/:id',(req,response) => {
    const query = {_id : parseInt(req.params.id)}
    console.log(req.body.usuario)
  
    const novosDados = { $set: {usuario: req.body.usuario, senha: req.body.senha} };
   
    const login = dbo.collection("login").updateOne(query, novosDados).then((data => {
        response.json(data)      
    }))     
})

app.post('/usuario',(req,response) => {
    console.log(req.body.usuario)
    dbo.collection("login").findOne({usuario: req.body.usuario, senha: req.body.senha}).then(data => { 
        if(data != null)
        {
            const token = jwt.sign({usuario: data._id} , SECRET, {expiresIn: 2000})
            response.json({auth: true, token})
        }
        else {

            response.json({msg: 'usuario ou senha invalida'})  

        }
    })

})

app.get('/' ,(req, res) => {res.send("BEM VINDO A API DE LOGIN COM JWT")} )

  app.listen(port, function() {
    console.log(`Server is running at localhost:${port}`)
  })

  function verifyJWT(req, res, next){
    const token = req.headers['x-access-token']
    jwt.verify(token, SECRET, (erro, decoded) => {
        if(erro){
            console.log('token invalido')
            res.json({msg:'token ausente ou invalido'})
            return false
        }
        req.body.usuario = decoded.usuario
        next()
    })
  }


