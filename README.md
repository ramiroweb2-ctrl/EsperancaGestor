# EsperançaGestor — ONG Rede Solidária Esperança

Sistema demonstrativo local para gestão de beneficiários, doadores, voluntários, doações e entregas.

## Como iniciar no Windows

1. Instale o Node.js LTS: https://nodejs.org (se ainda não estiver instalado).
2. Extraia o arquivo ZIP para uma pasta do computador.
3. Dê dois cliques em `INICIAR_NO_WINDOWS.bat`.
4. Na primeira execução, aguarde a instalação das dependências (é necessária conexão com a internet).
5. O navegador abrirá em `http://localhost:5173`.
6. Para encerrar, volte à janela preta e pressione `Ctrl + C`.

Alternativa pelo terminal, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

## Funcionalidades

- Painel com totais dos cadastros.
- Cadastro, pesquisa, edição e exclusão de beneficiários, doadores, voluntários, doações e entregas.
- Validação matemática de CPF no cadastro de beneficiários.
- Relatório geral para impressão ou opção “Salvar como PDF” do navegador.
- Persistência local em `server/data.json`.
- Dados fictícios de demonstração, sem dados pessoais reais do arquivo enviado.

## Importante

Este projeto é uma versão acadêmica demonstrativa para execução local. Não é um sistema pronto para uso com dados reais: ainda não possui autenticação/login, perfis de acesso, criptografia de dados pessoais, banco de dados MySQL, rotina automática de backup ou publicação segura. Não cadastre dados pessoais reais antes de implementar essas proteções e realizar uma revisão técnica.

Os registros são guardados em `server/data.json`. Faça cópia desse arquivo para preservar os cadastros. Para restaurar os dados fictícios iniciais, substitua o conteúdo pelo arquivo `server/dados-demonstracao.json`.

## Como executar no Windows

1. Instale o Node.js.
2. Extraia o projeto no computador.
3. Abra a pasta do projeto.
4. Execute o arquivo INICIAR_NO_WINDOWS.bat.
5. Aguarde a inicialização do frontend e da API.
6. Acesse http://localhost:5173 no navegador.

## Verificação da API

Para verificar se a API está funcionando, acesse:

http://localhost:3001/api/health

O retorno esperado é:

{"status":"ok"}

## Dados de demonstração

O projeto utiliza dados fictícios para fins acadêmicos.
