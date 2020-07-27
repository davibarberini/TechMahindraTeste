const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const assert = chai.assert;
const should = chai.should();

chai.use(chaiHttp);

//Modelo de usuário padrão para testes
const user = {
  nome: "Davi Barberini",
  email: "davibarberini@email.com",
  senha: "davibrc123",
  telefones: [
    {
      numero: "123456789",
      ddd: "11",
    },
  ],
};

describe("Testando as rotas de sign-in e de sign-up", () => {
  it("Deve conseguir registrar o usuario com sucesso", (done) => {
    chai
      .request(app)
      .post("/user/sign-up")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);

        done();
      });
  });

  it("Deve falhar no registro do usuario, devido a nenhum dado ser enviado", (done) => {
    chai
      .request(app)
      .post("/user/sign-up")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
