var mongo = require('mongodb');
const express = require('express')
const http = require('http');
const { response } = require('express');
const port = 3002 // local:3002 servidor: process.env.PORT
const app = express()
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const SECRET = 'ALESSANDRO'
var payload = {}
app.use(express.json());

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectId;

var DATABASE_URL  = "mongodb+srv://godinis22:36731249@teste.sncrx1j.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(DATABASE_URL)
var dbo = client.db("gestao") 

const DADOS_CRIPTOGRAFAR = {
    algoritmo : "aes256",
    segredo : "chaves",
    tipo : "hex"
};

function criptografar(senha) {
    const cipher = crypto.createCipher(DADOS_CRIPTOGRAFAR.algoritmo, DADOS_CRIPTOGRAFAR.segredo);
    cipher.update(senha);
    return cipher.final(DADOS_CRIPTOGRAFAR.tipo);
};

function descriptografar(senha) {
    const decipher = crypto.createDecipher(DADOS_CRIPTOGRAFAR.algoritmo, DADOS_CRIPTOGRAFAR.segredo);
    decipher.update(senha, DADOS_CRIPTOGRAFAR.tipo);
    return decipher.final();
};

app.put('/usuario/:id', verifyJWT, (req,response) => {
    const query = {_id :  ObjectID.createFromHexString(req.params.id)}
    console.log(req.body.usuario)
  
    const novosDados = { $set: {
        usuario: req.body.usuario, 
        senha: criptografar(req.body.senha),
        tipo: req.body.tipo
    } 
};
   
        dbo.collection("usuario").updateOne(query, novosDados).then((data => {
        response.json(data)      
    }))     
})

app.post('/usuario', verifyJWT, (req,response) => {
    const novosDados = {
        usuario: req.body.usuario, 
        senha: criptografar(req.body.senha),
        tipo: req.body.tipo
    } 
    console.log(novosDados.senha);
    dbo.collection("usuario").insertOne(novosDados).then(() => {
        response.json(novosDados)
   })   
})

app.post('/login',(req,response) => {
    const pass = descriptografar(req.body.senha)
    console.log('senha descrip... '+pass);
    dbo.collection("usuario").findOne({usuario: req.body.usuario, senha: pass}).then(data => { 
        if(data != null)
        {
            const token = jwt.sign({usuario: data._id} , SECRET, {expiresIn: 3000})
            response.json({data, auth: true, token})
        }
        else {

            response.json({msg: 'usuario ou senha invalida'})  

        }
    })

})

app.get('/' ,(req, res) => {res.send("BEM VINDO A API DE LOGIN COM JWT V5")} )

  app.listen(port, function() {
    console.log(`Server is running at localhost:${port}`)
  })

  function verifyJWT(req, res, next){
    const token = req.headers['x-access-token']
    jwt.verify(token, SECRET, (erro, decoded) => {

        if(erro){
            res.json({msg:'token ausente ou invalido'})
            return false
        }
        payload = decoded.usuario
        next()
    })
  }

  app.get('/sistemas',verifyJWT, (req,response) => {
    
    var query = { $and: [] };

    if (req.query.usuario) { query.$and.push({usuario: req.query.usuario}); }
    if (req.query.descricao) { query.$and.push({descricao: req.query.descricao}); }
    if (req.query.senha) { query.$and.push({senha: req.query.senha}); }

    let page = req.query.page;
    let limit = 3;
    let skip = limit * (page - 1);

    if(query.$and.length > 0){

        const sistema = dbo.collection("sistema").find(query).toArray().then((data => {
        response.json(data)
        }))
    }
    else{
        
        const sistema = dbo.collection("sistema").find({}).skip(skip).limit(limit).toArray().then((data => {
        response.json(data)    
        }))
    }
             
  })


  app.get('/sistema/:id',verifyJWT, (req,response) => {
    const sistema = dbo.collection("sistema").findOne({_id: ObjectID.createFromHexString(req.params.id)}).then((data => {
        response.json(data)     
    }))     
  })

  app.put('/sistema/:id', verifyJWT, (req,response) => {
    const query = {_id :  ObjectID.createFromHexString(req.params.id)}
    console.log("teste "+query._id)
    const novosDados = { $set: {
        descricao: req.body.descricao,
        usuario: req.body.usuario, 
        senha: req.body.senha
    } };
   
    const sistema = dbo.collection("sistema").updateOne(query, novosDados).then((data => {
        response.json(req.body)      
    }))     
})

app.post('/sistema', verifyJWT, (req,response) => {
            const novosDados = {
                descricao: req.body.descricao,
                usuario: req.body.usuario, 
                senha: req.body.senha
            } 
           
            dbo.collection("sistema").insertOne(novosDados).then(data => {
                response.json(req.body)
           })   
    })

  app.delete('/sistema/:id',(req,response) => {
    console.log(req.params.id)
   
    const sistema = dbo.collection("sistema").deleteOne({_id: ObjectID.createFromHexString(req.params.id)}).then((data => {
        response.json({msg: true})      
  }))     
})
