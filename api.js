const express = require('express')
const { response } = require('express');
const port = process.env.PORT // local:3002 servidor: process.env.PORT
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

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function criptografar(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex') 
   }
   
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
    const pass = criptografar(req.body.senha)
    //const pass = descriptografar(encript)
    console.log('senha descrip... '+JSON.stringify(pass));
    dbo.collection("usuario").findOne({usuario: req.body.usuario, senha: pass}).then(data => {
        console.log('retorno '+data); 
        if(data != null)
        {
            const token = jwt.sign({usuario: data._id} , SECRET, {expiresIn: 300000})
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

  app.get('/sistemas',verifyJWT, (req) => {
    
    var query = { $and: [] };

    if (req.query.usuario) { query.$and.push({usuario: req.query.usuario}); }
    if (req.query.descricao) { query.$and.push({descricao: req.query.descricao}); }
    if (req.query.senha) { query.$and.push({senha: req.query.senha}); }

    let page = req.query.page;
    let limit = 3;

    if(query.$and.length > 0){

    }
    else{
        
    }
             
  })


  app.get('/sistema/:id',verifyJWT, () => {
  })

  app.put('/sistema/:id', verifyJWT, (req) => {
    const query = {_id :  ObjectID.createFromHexString(req.params.id)}
    console.log("teste "+query._id)
   
})

app.post('/sistema', verifyJWT, (req,response) => {
            const novosDados = {
                descricao: req.body.descricao,
                usuario: req.body.usuario, 
                senha: req.body.senha
            } 
           
            dbo.collection("sistema").insertOne(novosDados).then(() => {
                response.json(req.body)
           })   
    })

  app.delete('/sistema/:id',(req) => {
    console.log(req.params.id)
   
})
