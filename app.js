const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = process.env.PORT || 8080;
const connectionString = require("./connection");

const userRouter = require("./controllers/users-router");
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
//Verificar se teve algum erro ao conectar ao banco
db.on("error", (error) =>
  console.log({
    mensagem: "Não foi possivel conectar ao banco de dados",
  })
);
//Verificar se conectamos com sucesso ao banco
db.once("open", function () {
  console.log("Conexão com o banco concluida");
});

//Para receber dados em json
server.use(bodyParser.json());

server.get("/", function (req, res) {
  res.status(200).send("Testando funcionamento");
});

//Utilizando Express.Router para as rotas do usuário
server.use("/user", userRouter);

//Servidor escutando chamadas na porta {port}
server.listen(port, function () {
  console.log(`Listenting to port ${port}`);
});

module.exports = server;
