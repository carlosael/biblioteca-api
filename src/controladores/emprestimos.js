const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {
    try {
        const query = `
        select e.id, u.nome as usuario, u.telefone, u.email, l.nome, e.status
        from emprestimos e
        left join usuarios u on e.usuario_id = u.id
        left join livros l on e.livro_id = l.id
        `;

        const { rows: emprestimos } = await conexao.query(query);

        return res.status(200).json(emprestimos);
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const obterEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Empréstimo não encontrado.');
        }

        return res.status(200).json(emprestimo.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarEmprestimo = async (req, res) => {
    const { usuario_id, livro_id } = req.body;

    try {
        const query = `insert into emprestimos (usuario_id, livro_id)
        values ($1, $2)`;

        await conexao.query(query, [usuario_id, livro_id]);

        return res.status(200).json('Empréstimo cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarEmprestimo = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, livro_id, status } = req.body;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Empréstimo não encontrado.');
        }

        const query = `update emprestimos set 
        usuario_id =$1,
        livro_id = $2,
        status = $3
        where id = $4`;

        await conexao.query(query, [usuario_id, livro_id, status, id]);

        return res.status(200).json('Usuário atualizado com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id  = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Usuário não encontrado')
        }

        const query = 'delete from emprestimos where id = $1';

        await conexao.query(query, [id]);

        return res.status(200).json('Usuário foi excluído com sucesso');
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = {
    listarEmprestimos,
    obterEmprestimo,
    cadastrarEmprestimo,
    atualizarEmprestimo,
    excluirEmprestimo
}