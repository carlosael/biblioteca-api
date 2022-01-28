const conexao = require('../conexao');

const listarUsuarios = async (req, res) => {
    try {
        const { rows: usuarios } = await conexao.query('select * from usuarios');

        for (const usuario of usuarios) {
            const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [usuario.id]);
            usuario.emprestimos = emprestimos;
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado.');
        }

        const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);
        
        usuario.rows[0].emprestimos = emprestimos;

        return res.status(200).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarUsuario = async (req, res) => {
    const { nome, idade, email, telefone, cpf } = req.body;

    try {
        const query = `insert into usuarios (nome, idade, email, telefone, cpf)
        values ($1, $2, $3, $4, $5)`;
        const usuarioCadastrado = await conexao.query(query, [nome, idade, email, telefone, cpf]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(404).json('Não foi possível cadastrar usuário.')
        }

        return res.status(200).json('Usuário cadastrado com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, cpf } = req.body;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado.');
        }

        const query = `update usuarios set 
        nome =$1,
        idade = $2,
        email = $3,
        telefone = $4,
        cpf = $5
        where id = $6`;

        const usuarioAtualizado = await conexao.query(query, [nome, idade, email, telefone, cpf, id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(404).json('Não foi possível atualizar usuário.')
        }

        return res.status(200).json('Usuário atualizado com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('select * from usuarios where id  = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado')
        }

        const queryTwo = `
        select e.id, u.id as usuario_id, u.nome from emprestimos e
        join usuarios u on e.usuario_id = u.id
        where usuario_id = $1
        `
        const usuarioTemEmprestimo = await conexao.query(queryTwo, [id]);

        if (usuarioTemEmprestimo.rowCount === 0) {
            const query = 'delete from usuarios where id = $1';
            const usuarioExcluido = await conexao.query(query, [id]);

            if (usuarioExcluido.rowCount === 0) {
                return res.status(404).json('Não foi possível excluir o usuário.')
            }

            return res.status(200).json('Usuário foi excluído com sucesso');
        } else {
            return res.status(404).json('Usuário não pode ser excluído.')
        }


    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = {
    listarUsuarios,
    obterUsuario,
    cadastrarUsuario,
    atualizarUsuario,
    excluirUsuario
}