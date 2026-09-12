# Como publicar o site — passo a passo bem detalhado

Já fiz tudo que consegui fazer sozinho: o site está pronto, com sua foto,
seu WhatsApp, seu nome, e a function que grava os leads no seu CRM está
escrita exatamente com os mesmos campos que o CRM usa (confirmei isso lendo
o código do próprio CRM). Só faltam duas coisas que só você pode fazer,
porque envolvem suas contas: **gerar uma senha especial no Firebase** e
**publicar no Netlify**. Vou te guiar clique a clique.

---

## PARTE 1 — Gerar a credencial do Firebase (5 minutos)

Essa credencial é como uma "senha mestre" que permite que o site grave
leads direto no banco de dados do seu CRM.

1. Abra [console.firebase.google.com](https://console.firebase.google.com) no navegador e entre com a conta Google que você usa no CRM.
2. Você vai ver uma lista de projetos. Clique no projeto do seu CRM (o nome técnico é `crm---parceiros-cogecom`).
3. No canto superior esquerdo da tela, tem uma **engrenagem** (ícone ⚙️), ao lado de "Visão geral do projeto". Clique nela.
4. Vai abrir um menu — clique em **"Configurações do projeto"**.
5. No topo dessa nova tela, tem várias abas: Geral, Contas de serviço, etc. Clique na aba **"Contas de serviço"**.
6. Nessa aba, tem um botão azul escrito **"Gerar nova chave privada"**. Clique nele.
7. Vai aparecer um aviso pedindo confirmação — clique em **"Gerar chave"**.
8. O navegador baixa automaticamente um arquivo terminado em `.json` (algo como `crm---parceiros-cogecom-firebase-adminsdk-xxxxx.json`). Guarde esse arquivo — vamos usá-lo na Parte 2.

⚠️ Esse arquivo dá acesso total ao seu banco de dados. Não envie por WhatsApp, e-mail, ou qualquer lugar público — use ele só nos passos abaixo, dentro do site do Netlify.

9. Abra esse arquivo `.json` com o Bloco de Notas (ou qualquer editor de texto simples — no Windows, clique com o botão direito no arquivo → "Abrir com" → "Bloco de Notas"). Você vai ver um texto com várias linhas parecidas com:
   ```
   "project_id": "crm---parceiros-cogecom",
   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n",
   "client_email": "firebase-adminsdk-xxxxx@crm---parceiros-cogecom.iam.gserviceaccount.com",
   ```
   Deixe essa janela aberta — vamos copiar esses 3 valores um por um na próxima parte.

---

## PARTE 2 — Publicar no Netlify (10 minutos)

1. Abra [app.netlify.com](https://app.netlify.com) e entre na sua conta (a mesma que você já usa pra hospedar seus outros sites).
2. Baixe a pasta completa que te mandei aqui na conversa e salve todos os arquivos **numa única pasta no seu computador**, mantendo a mesma estrutura (incluindo a subpasta `netlify` com a subpasta `functions` dentro).
3. Na tela inicial do Netlify, procure o botão **"Add new site"** (geralmente no canto superior direito) → clique → escolha **"Deploy manually"**.
4. Vai aparecer uma área pontilhada escrito algo como "Drag and drop your site folder here". **Arraste a pasta inteira** (não os arquivos um por um — a pasta toda) pra essa área.
5. O Netlify vai processar e publicar o site — isso leva menos de um minuto. Ao terminar, ele te mostra um link tipo `https://algum-nome-aleatorio.netlify.app`. **O site já está no ar nesse momento**, mas o formulário ainda não vai funcionar até você fazer o próximo passo.
6. Agora, dentro da página do site que acabou de ser criado no Netlify, procure a opção de configurações. O nome e o lugar exato mudam um pouco dependendo da versão do painel — tente nesta ordem:
   - Um menu ou aba chamada **"Site configuration"** ou **"Site settings"** (geralmente no topo ou numa barra lateral esquerda, quando você está dentro do site específico, não na lista geral de sites)
   - Dentro dela, procure por **"Environment variables"** — pode estar direto no menu, ou dentro de uma seção maior chamada **"Build & deploy"**
   - Se não achar nenhum dos dois, use a barra de busca do próprio painel do Netlify (geralmente uma lupa 🔍 no topo) e digite "environment variables" — ela te leva direto pra tela certa

7. Clique em **"Add a variable"** (ou "Adicionar variável") — você vai criar 3, uma por vez. **Atenção a um detalhe que faz diferença:** ao criar cada variável, vai ter uma opção de **"Scopes"** (escopos) — marque **"Functions"** (ou "All scopes"/"Todos os escopos"). Se deixar marcado só "Builds", a function não vai conseguir enxergar a variável e o formulário vai dar erro mesmo com tudo certo:

   **Variável 1:**
   - Nome (Key): `FIREBASE_PROJECT_ID`
   - Valor (Value): copie o texto que está depois de `"project_id":` no arquivo `.json` (sem as aspas) — algo como `crm---parceiros-cogecom`

   **Variável 2:**
   - Nome (Key): `FIREBASE_CLIENT_EMAIL`
   - Valor (Value): copie o texto que está depois de `"client_email":` no arquivo `.json` (sem as aspas) — algo como `firebase-adminsdk-xxxxx@crm---parceiros-cogecom.iam.gserviceaccount.com`

   **Variável 3:**
   - Nome (Key): `FIREBASE_PRIVATE_KEY`
   - Valor (Value): copie o texto que está depois de `"private_key":` no arquivo `.json` (sem as aspas), incluindo tudo — desde `-----BEGIN PRIVATE KEY-----` até `-----END PRIVATE KEY-----\n`. É um texto longo, cole ele todo mesmo.

8. Depois de criar as 3 variáveis, você precisa **publicar de novo** pra elas entrarem em vigor. Procure a aba **"Deploys"** no menu do site, e clique em **"Trigger deploy"** → **"Deploy site"** (ou arraste a pasta de novo, do jeito que fez no passo 4).

9. Pronto — depois desse segundo deploy, o site e o formulário já estão funcionando juntos.

---

## PARTE 3 — Testando

1. Abra o link do seu site (o `https://...netlify.app`, ou o domínio próprio se você configurar um).
2. Clique em "Quero economizar", preencha o formulário com um teste seu (pode usar seu próprio nome e WhatsApp) e envie.
3. Deve aparecer a tela "Cadastro recebido!". Se aparecer uma mensagem de erro em vermelho ("Não conseguimos enviar agora...") em vez disso, siga o passo 4.
4. Volte no Netlify → seu site → aba **"Functions"** (no menu do site) → clique em **"submit-lead"** → tem uma área de **"logs"** que mostra o erro exato. Se não souber o que fazer com o erro, me manda um print aqui que eu te ajudo.
5. Se deu tudo certo: abra seu CRM, vá no **Funil**, e confira se um lead novo com o nome que você testou apareceu na primeira coluna, com uma tarefa "Enviar abordagem inicial" já criada. Depois é só apagar esse lead de teste.

---

## O que já está pronto (feito por mim)
- Site completo: textos, formulário multi-step, FAQ, depoimentos (com espaço reservado)
- Sua foto já embutida no HTML
- WhatsApp configurado: 5551997332278
- Marca do site: Eduardo Souza — Consultor de Energia e Sustentabilidade, com link pro seu Instagram
- A function que grava no Firestore, com os **mesmos campos exatos** que o seu CRM usa quando você cadastra um lead manualmente (confirmei lendo o código do CRM) — incluindo a etapa inicial "abordagem" e a tarefa automática "Enviar abordagem inicial"
- Rastreamento de campanha: qualquer link com `?utm_source=instagram&utm_campaign=nome-da-campanha` no final já é registrado automaticamente na origem do lead

## O que só você pode fazer (está nesta pasta)
- Gerar a chave do Firebase (Parte 1)
- Publicar no Netlify e configurar as 3 variáveis (Parte 2)

## Ainda pendente, pra quando você tiver
- Substituir os 3 depoimentos placeholder pelos relatos reais dos clientes
