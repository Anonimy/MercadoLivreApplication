# Mercado Livre - My First App

Para mais informações, visite: https://developers.mercadolivre.com.br

Para seguir este tutorial, você precisará ter instalado:
- Git (https://git-scm.com/downloads)
- Node.js (https://nodejs.org/en/download)

Para esse tutorial, utilizaremos o Git na versão 2.20.1 e o Node.js na versão 12.3.1, mas recomendamos sempre utilizar as versões estáveis mais atualizadas.
___

## Setup do projeto

- Crie o diretório do projeto e vá até ele no seu terminal.

- Rode o comando `npm init -y` para inicializar um projeto em Node.js. Vários arquivos devem ser gerados no seu diretório.

- Agora vamos instalar as dependências que utilizaremos no decorrer do projeto. Rode o comando `npm install --save mercadolibre express ejs dotenv multer`.
  - **mercadolibre**: esse é o SDK do Mercado Livre, que irá auxiliar/facilitar o desenvolvimento da nossa integração.

  - **express**: facilitará o desenvolvimento da nossa aplicação em Node.js.

  - **ejs**: irá trabalhar junto com o express no auxílio do desenvolvimento da aplicação, facilitando a troca de informações entre o servidor e o cliente.

  - **dotenv**: permitirá inserir variáveis de ambiente definidos em um arquivo *.env* no nosso código.

  - **multer**: facilitará o upload de arquivos (envio de fotos para o Mercado Livre).

___

## Início do desenvolvimento

- Crie um arquivo chamado `app.js` no seu diretório.

- Crie um novo diretório chamado `bin`, e dentro desse novo diretório, um arquivo chamado `www`. Nele, iremos fazer o setup da aplicação.

- Dentro do arquivo `app.js`, preencha com o seguinte trecho de código:
  ```js
  const express = require('express');
  const app = express();
  module.exports = app;
  ```
  No trecho acima, importamos a dependência **express**, geramos um objeto que representa toda a nossa aplicação e exportamos ela do arquivo `app.js`.

- Agora, dentro do arquivo `www`, preenchemos com o seguinte código:
  ```js
  #!/usr/bin/env node

  const app = require('../app');
  const http = require('http');

  const port = process.env.PORT || 3000;
  app.set('port', port);

  const server = http.createServer(app);
  server.listen(port);
  server.on('error', handleError);
  server.on('listening', handleStartListening);

  function handleError(error) {
    if (error) {
      switch (error.code) {
        case 'EACCES':
          console.error(`${port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${port} is already in use`);
          process.exit(1);
          break;
      }
    }
    throw error;
  }

  function handleStartListening() {
    console.log(`Listening on port ${server.address().port}`)
  }
  ```
  No trecho acima, declaramos para os sistemas operacionais Unix que o arquivo sem extensão `www` deve ser interpretado como "node", definimos a porta que utilizaremos, criamos uma instância do nosso servidor e iniciamos efetivamente o servidor.
  
  Basicamente, isso significa que o arquivo responsável por deixar nosso servidor aberto ou fechado é o arquivo `www`.

- Para facilitar que possamos abrir ou fechar o servidor quando quisermos, abra o arquivo `package.json`. Ele deve se parecer com isso:
  ```json
  {
    "name": "mercadolibre-app",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "dotenv": "^8.0.0",
      "ejs": "^2.6.2",
      "express": "^4.17.1",
      "mercadolibre": "0.0.13",
      "multer": "^1.4.2"
    }
  }
  ```
  O `package.json` é um arquivo com informações gerais do seu projeto e serve para gerenciar sua aplicação e vincular com o *npm* (**N**ode **P**ackage **M**anager). Há uma propriedade chamada "scripts" que permite que você execute comandos através do npm. Utilizaremos essa propriedade para abrir nosso servidor localmente.

- Dentro de "scripts", Apague o script "test" que vem pré-definido e adicione a seguinte propriedade:
  ```json
  {
    "start": "node ./bin/www"
  }
  ```

- Após definido o script de inicialização no `package.json`, vamos começar a fazer a parte visual da nossa integração. Crie um diretório chamado `views`. Dentro do diretório que acabamos de criar, crie um arquivo `index.ejs`. Essa será nossa página principal. Preencha com o seguinte trecho de código:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>My Meli Application</title>
  </head>
  <body>
    <h1>Welcome to your own new MeliApplication!</h1>
    <p><a href="/home">Let's Begin!</a></p>
  </body>
  </html>
  ```

- Uma vez que temos nosso visual definido, vamos ligá-la ao servidor que criamos. Podemos fazer isso modificando o arquivo `app.js` da seguinte forma:
  ```js
  const express = require('express');
  const app = express();
  const path = require('path');

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => {
    res.render('index');
  });

  module.exports = app;
  ```

- Teste sua aplicação rodando o comando `npm start` no terminal!<br>
_Lembre-se de que você pode pará-la a qualquer momento pressionando as teclas **Ctrl+C**._
____

## Crie uma aplicação no Mercado Livre

Agora que temos uma aplicação em Node.js pronta, é hora de criar nossa aplicação dentro do Mercado Livre.

- Para isso, acesse: https://developers.mercadolivre.com.br/devcenter.

- Clique em "Criar nova aplicação".