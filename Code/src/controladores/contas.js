let { banco, contas, ultimoID, saques, depositos, transferencias } = require('../bancodedados');

const listarContas = (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).json({ mensagem: 'A senha do banco é obrigatória.' });
    }

    if (senha_banco !== banco.senha) {
        return res.status(400).json({ mensagem: 'A senha do banco informada é inválida. ' });
    }

    res.json(contas);
}

const criarConta = (req, res) => {
    const { nome, email, cpf, telefone, senha, data_nascimento } = req.body;

    if (!nome || !email || !cpf || !telefone || !senha || !data_nascimento) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    const contaExistente = contas.find(conta => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email
    });

    if (contaExistente) {
        return res.status(400).json({ mensagem: "CPF ou Email já cadastrados!!!" });
    }

    const novaConta = {
        numero: ultimoID++,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    contas.push(novaConta);

    return res.status(201).send();
}

const atualizarUsuarioConta = (req, res) => {
    const { nome, email, cpf, telefone, senha, data_nascimento } = req.body;
    const { numeroConta } = req.params;

    if (!nome || !email || !cpf || !telefone || !senha || !data_nascimento) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numeroConta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta inexistente!" });
    }

    if (cpf !== contaEncontrada.usuario.cpf) {
        const existeCpf = contas.find(conta => conta.usuario.cpf === cpf);

        if (existeCpf) {
            return res.status(400).json({ mensagem: "Cpf já cadastrado em uma conta." });

        }
    }

    if (!email !== contaEncontrada.usuario.email) {
        const existeEmail = contas.find(conta => conta.usuario.email === email);

        if (existeEmail) {
            return res.status(400).json({ mensagem: "Email já cadastrado em uma conta." });

        }
    }

    contaEncontrada.usuario = {
        nome,
        email,
        cpf,
        telefone,
        senha,
        data_nascimento
    }

    return res.status(204).send();
}

const deletarConta = (req, res) => {
    const { numeroConta } = req.params;

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numeroConta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta inexistente!" });
    }

    if (contaEncontrada > 0) {
        return res.status(403).json({ mensagem: "A conta só poderá ser deletada se o saldo for R$0,00." });
    }

    contas = contas.filter(conta => Number(conta.numero) !== Number(numeroConta));

    return res.status(204).send();
}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e da senha são obrigatórios!' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta inexistente!" });
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Senha invalida!" });
    }

    return res.json({ saldo: contaEncontrada.saldo });
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e da senha são obrigatórios!' });
    }

    const contaEncontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta inexistente!" });
    }

    if (contaEncontrada.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Senha invalida!" });
    }

    const extratoDepositos = depositos.filter(deposito => Number(deposito.numero_conta) === Number(numero_conta));

    const extratoSaques = saques.filter(saque => Number(saque.numero_conta) === Number(numero_conta));

    const transferenciasEnviadas = transferencias.filter(transferencia => Number(transferencia.numero_conta_origem) === Number(numero_conta));

    const transferenciasRecebidas = transferencias.filter(transferencia => Number(transferencia.numero_conta_destino) === Number(numero_conta));

    return res.json({
        depositos: extratoDepositos,
        saques: extratoSaques,
        transferenciasEnviadas,
        transferenciasRecebidas
    });
}


module.exports = {
    listarContas,
    criarConta,
    atualizarUsuarioConta,
    deletarConta,
    saldo,
    extrato
}
