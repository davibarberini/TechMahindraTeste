const express = require("express");
const SHA256 = require("crypto-js/sha256");
require("dotenv-safe").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/users-models");

const router = express.Router();

// Rota para registrar um novo usuario
router.post("/sign-up", (req, res) => {
  // Busca por um usuario com esse email
  User.findOne({ email: req.body.email })
    .exec()
    .then((data) => {
      // Caso já exista um usuário com esse email
      if (data) {
        res.status(409).json({
          mensagem: "Email já existente",
        });
      }
      // Caso não exista nenhum usuario com esse email
      else {
        // Cria um usuário e salva no banco
        const mongooseID = mongoose.Types.ObjectId;
        const jwtToken = jwt.sign({ mongooseID }, process.env.SECRET, {
          expiresIn: 1800, // expira em 30 minutos
        });
        const user = new User({
          id: mongooseID,
          nome: req.body.nome,
          email: req.body.email,
          // Converte a senha e o token para hash
          senha: SHA256(req.body.senha),
          telefones: req.body.telefones,
          token: SHA256(jwtToken),
        });
        user
          .save()
          .then((data) => {
            res.status(201).json(data);
          })
          .catch((err) => {
            res.json({
              mensagem: err,
            });
          });
      }
    })
    .catch((err) => {
      res.json({
        mensagem: err,
      });
    });
});

// Rota apara logar um usuario já existente
router.post("/sign-in", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((data) => {
      // Caso exista um usuário com esse email
      if (data) {
        // Converte a senha em hash para comparar
        const senha = SHA256(req.body.senha);
        if (data.senha == senha) {
          // Senha bate
          // Passa pra o middleware que atualizara o tempo de ultimo login e retornará os dados
          res.locals.userData = data;
          next();
        } else {
          // Senha não bate
          res.status(401).json({
            mensagem: "Usuario e/ou senha inválidos",
          });
        }
      }
      // Caso não exista nenhum usuario com esse email
      else {
        res.status(401).json({
          mensagem: "Usuario e/ou senha inválidos",
        });
      }
    })
    .catch((err) => {
      res.json({
        mensagem: err,
      });
    });
});

router.post("/sign-in", (req, res) => {
  // Atualiza o valor do ultimo login do usuário
  User.findByIdAndUpdate(
    { _id: res.locals.userData._id },
    { ultimo_login: Date.now() },
    { useFindAndModify: false }
  )
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.json({
        mensagem: err,
      });
    });
});

// Rota para achar um usuário pelo seu id
router.get("/findUser/:user_id", (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Nenhum token foi enviado
  if (!req.headers.authorization) {
    res.status(401).json({
      mensagem: "Não Autorizado",
    });
  }
  // Um token foi enviado
  else {
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        mensagem: "Não Autorizado",
      });
    } else {
      // Busca pelo usuario com o user_id
      const authToken = authHeader.substring(7, authHeader.length);
      const id = req.params.user_id;
      User.findById(id)
        .then((data) => {
          // Token bate
          if (data.token == authToken) {
            // Diferença de tempo entre o ultimo login e o tempo atual
            const timePassed = Date.now() - data.ultimo_login;

            // Se o tempo desde o ultimo login for maior do que 30 minutos
            if (timePassed / 60000 < 30) {
              res.status(200).json(data);
            } else {
              // Tempo ultrapassou os 30 minutos
              res.status(401).json({
                mensagem: "Sessão Inválida",
              });
            }
          }
          // Token não bate
          else {
            res.status(401).json({
              mensagem: "Não Autorizado",
            });
          }
        })
        // Nenhum usuario encontrado com esse user_id
        .catch((err) => {
          res.json({
            mensagem: err,
          });
        });
    }
  }
});

router.get("/findAllUsers", (req, res) => {
  User.find().then((data) => {
    res.json(data);
  });
});

router.delete("/deleteUser/:user_id", (req, res) => {
  const id = req.params.user_id;
  User.findByIdAndDelete(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({
        mensagem: err,
      });
    });
});
module.exports = router;
