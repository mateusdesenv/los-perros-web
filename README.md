# Los Perros Market — Cardápio Online React

Projeto inicial em **React + Vite** para o cardápio online da Los Perros Market.

O projeto usa o JSON do cardápio como carga inicial e salva os dados no `localStorage`, permitindo evoluir depois para API, painel administrativo e e-commerce completo.

## O que já vem pronto

- Landing page com identidade visual Los Perros Market.
- Tela inicial exibindo apenas a seção **Mais pedidos** como vitrine de produtos.
- Tela separada em `/cardapio` para o **cardápio completo**.
- Cardápio completo baseado em `src/data/menuData.json`.
- Filtro por categoria.
- Busca por produto/categoria.
- Destaques/mais pedidos automáticos.
- Carrinho lateral.
- Persistência do cardápio e carrinho no `localStorage`.
- Confirmação de idade para produtos alcoólicos.
- Botão para restaurar os dados originais do JSON.
- Finalização de pedido via WhatsApp quando o número estiver configurado.
- Layout responsivo.
- `vercel.json` com rewrite para permitir acesso direto à rota `/cardapio`.

## Rodando localmente

```bash
npm install
npm run dev
```

Depois acesse a URL exibida no terminal, normalmente:

```bash
http://localhost:5173
```


## Deploy na Vercel

O projeto já inclui os arquivos necessários para deploy como SPA React/Vite na Vercel:

- `vercel.json` com `installCommand`, `buildCommand`, `outputDirectory` e rewrite para rotas internas como `/cardapio`.
- `vite.config.js` com `base: '/'` e saída em `dist`.
- `.vercelignore` para não enviar `node_modules`, `dist` e arquivos locais de ambiente.
- `.gitignore` para versionamento limpo.
- `.env.example` para configurar o WhatsApp sem expor dados sensíveis.

Configuração esperada na Vercel:

```txt
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Configure a variável de ambiente no painel da Vercel:

```env
VITE_WHATSAPP_NUMBER=5548999999999
```

Depois do deploy, as rotas `/` e `/cardapio` devem funcionar mesmo acessadas diretamente pelo navegador.

## Build

```bash
npm run build
```

## Configurar WhatsApp

Crie um arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Preencha com o número da distribuidora:

```env
VITE_WHATSAPP_NUMBER=5548999999999
```

Use apenas números, com DDI + DDD.

Se o número não estiver configurado, o botão de finalizar pedido copia a mensagem do pedido para a área de transferência.

## Estrutura principal

```txt
src/
  App.jsx
  styles.css
  data/menuData.json
  hooks/useLocalStorageState.js
  utils.js
  assets/
    logo-badge.jpg
    logo-main.jpg
    mascots.jpg
vercel.json
```

## Observações

- Os produtos do JSON estão com `image: null`; por isso o layout usa cards visuais por categoria.
- Produtos com `priceInCents: null` aparecem como `Consultar`.
- Produtos com `ageRestriction18: true` exigem confirmação antes de entrar no carrinho.
- Para resetar alterações locais, use o botão **Restaurar JSON** dentro do cardápio.

## Última atualização

- Banner hero substituído pela nova imagem promocional gerada.
- Imagem salva em `src/assets/hero-banner.webp` e importada no `Hero` via Vite.
- Versão mobile mantém navegação inferior com Home, Carrinho e Cardápio.
- Header superior fica oculto no mobile.
# los-perros-web
