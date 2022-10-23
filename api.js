var mongo = require('mongodb');
const express = require('express')
const http = require('http');
const { response } = require('express');
const port = 3002// process.env.PORT
const app = express()
const jwt = require('jsonwebtoken');
const { verify } = require('crypto');

const SECRET = 'ALESSANDRO'
var payload = {}
app.use(express.json());

var MongoClient = require('mongodb').MongoClient;
var DATABASE_URL  = "mongodb+srv://godinis22:36731249@teste.sncrx1j.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(DATABASE_URL)
var dbo = client.db("gestao") 

app.put('/usuario/:id', verifyJWT, (req,response) => {
    const query = {_id : parseInt(req.params.id)}
    console.log(req.body.usuario)
  
    const novosDados = { $set: {usuario: req.body.usuario, senha: req.body.senha} };
   
    const usuario = dbo.collection("usuario").updateOne(query, novosDados).then((data => {
        response.json(data)      
    }))     
})

app.post('/usuario',(req,response) => {
    console.log(req.body.usuario)
    dbo.collection("usuario").findOne({usuario: req.body.usuario, senha: req.body.senha}).then(data => { 
        if(data != null)
        {
            const token = jwt.sign({usuario: data._id} , SECRET, {expiresIn: 300})
            response.json({auth: true, token})
        }
        else {

            response.json({msg: 'usuario ou senha invalida'})  

        }
    })

})

app.get('/' ,(req, res) => {res.send("BEM VINDO A API DE LOGIN COM JWT V2")} )

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
        payload = decoded.usuario
        next()
    })
  }

  app.get('/sistemas',verifyJWT, (req,response) => {
   
    const sistema = dbo.collection("sistema").find({}).toArray().then((data => {
        response.json(data)
        
    }))
     
  })


  app.get('/sistema/:id',verifyJWT, (req,response) => {
    const sistema = dbo.collection("sistema").findOne({descricao: req.params.id.toString()}).then((data => {
        response.json(data)     
    }))     
  })

  app.put('/sistema/:id', verifyJWT, (req,response) => {
    const query = {descricao : req.params.id.toString()}  
    const novosDados = { $set: {
        descricao: req.body.descricao,
        usuario: req.body.usuario, 
        senha: req.body.senha
    } };
   
    const sistema = dbo.collection("sistema").updateOne(query, novosDados).then((data => {
        response.json(data)      
    }))     
})

app.post('/sistema', verifyJWT, (req,response) => {
    dbo.collection("sistema").findOne({descricao: req.body.descricao}).then(data => { 
        if(data == null)
        {
            const novosDados = {
                descricao: req.body.descricao,
                usuario: req.body.usuario, 
                senha: req.body.senha
            } 
           
            dbo.collection("sistema").insertOne(novosDados).then(data => {
                response.json('cadastrado com sucesso')
           })
        }
        else {

            response.json({msg: 'sistema já cadastrado'})  

        }
    })

})

  app.delete('/sistema/:id',(req,response) => {
    console.log(req.params.id)
   
    const sistema = dbo.collection("sistema").deleteOne({descricao: req.params.id.toString()}).then((data => {
        response.json({msg:"apagado com sucesso"})      
  }))     
})
