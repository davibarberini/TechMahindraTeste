const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  telefones: { type: Array, default: [] },
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
  ultimo_login: { type: Date, default: Date.now },
  token: { type: String, required: true },
});

// Define a variavel data_criacao e data_atualizacao para o momento da criacao do usuario
userSchema.pre('save', (next) => {
  if (!this.data_criacao) {
    this.data_criacao = Date.now();
  }
  if (!this.data_atualizacao) {
    this.data_atualizacao = Date.now();
  }
  if (!this.ultimo_login) {
    this.ultimo_login = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
