const conexao = require('../conexao')

const listarLivros = async (req, res) => {
    try {
        const query = `
            select l.id, a.nome as nome_autor, l.nome, l.genero, l.editora, l.data_publicacao from livros l
            left join autores a on l.autor_id = a.id
        `;
        const { rows: livros } = await conexao.query(query);

        return res.status(200).json(livros);
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const obterLivro = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'select * from livros where id=$1';
        const livro = await conexao.query(query, [id]);

        if (livro.rowCount === 0) {
            return res.status(404).json('Livro não encontrado.');
        }

        return res.status(200).json(livro.rowCount[0]);
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const cadastrarLivro = async (req, res) => {
    const { autor_id, nome, genero, editora, data_publicacao } = req.body;

    try {
        const query = 'insert into livros (autor_id, nome, genero, editora, data_publicacao) values ($1, $2, $3, $4, $5)';
        const livroCadastrado = await conexao.query(query, [autor_id, nome, genero, editora, data_publicacao]);

        if (livroCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar o livro.')
        }

        return res.status(200).json('Livro cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarLivro = async (req, res) => {
    const { id } = req.params;
    const { autor_id, nome, genero, editora, data_publicacao } = req.body;

    try {
        const query = 'select * from livros where id=$1';
        const livro = await conexao.query(query, [id]);

        if (livro.rowCount === 0) {
            return res.status(404).json('Livro não encontrado.');
        }

        const secondQuery = `update livros set
         autor_id = $1,
         nome = $2,
         genero = $3,
         editora = $4,
         data_publicacao = $5
         where id = $6 `;

        const livroAtualizado = await conexao.query(secondQuery, [autor_id, nome, genero, editora, data_publicacao, id]);

        if (livroAtualizado === 0) {
            return res.status(404).json('Não foi possível atualizar o livro.');
        }

        return res.status(200).json('O livro foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const excluirLivro = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'select * from livros where id=$1';
        const livro = await conexao.query(query, [id]);

        if (livro.rowCount === 0) {
            return res.status(404).json('Livro não encontrado.');
        }

        const queryLivroComEmprestimo = `
        select e.id, l.id as livro_id from emprestimos e
        left join livros l on e.livro_id = l.id
        where livro_id = $1`;

        const livroComEmprestimo = await conexao.query(queryLivroComEmprestimo, [id]);

        if (livroComEmprestimo.rowCount === 0) {
            const secondQuery = 'delete from livros where id = $1';
            const livroExcluido = await conexao.query(secondQuery, [id]);

            if (livroExcluido.rowCount === 0) {
                return res.status(404).json('Não foi possível excluir o livro');
            }

            return res.status(200).json('O livro excluído com sucesso.');
        } else {
            return res.status(404).json('Livro não pode ser excluído.')
        }


    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = {
    listarLivros,
    obterLivro,
    cadastrarLivro,
    atualizarLivro,
    excluirLivro
}