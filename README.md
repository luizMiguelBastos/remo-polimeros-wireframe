# Remo Polímeros · Wireframe v1.5

Wireframe do novo site da Remo Polímeros para validar **usabilidade**, **navegação**, **onde fica cada informação** e a **identidade visual** antes de entrarem fotos reais, vídeos e os movimentos finais.

**Link:** https://luizmiguelbastos.github.io/remo-polimeros-wireframe/

## Estrutura (v1.5)
A home é um ponto de partida: hero com fotos dos setores alternando, dois botões (**SOBRE NÓS** e **NOSSOS PRODUTOS**) e 6 cards, um para cada seção. Cada seção é uma página própria.

| Página | Conteúdo |
|---|---|
| `index.html` | Hero com fotos dos setores alternando, cards "Escolha por onde começar" e contato |
| `produtos.html` | Índice de resinas que abre ao clicar e comparador de duas linhas |
| `produto.html?linha=abs` | Página de cada linha (troque `abs` por `abs-pc`, `asa`, `pbt`, `pc`, `pc-compostos`, `pmma`, `pom` ou `san`) |
| `historia.html` | Manifesto, faixa em parallax, números, linha do tempo com fotos e depoimento |
| `valores.html` | Missão, visão e valores, compromisso ambiental e certificação ISO 9001:2015* |
| `tecnologias.html` | Laboratório de cores, dureza sob medida (régua Shore ligada à rolagem) e as 4 etapas de desenvolvimento |
| `onde-atuamos.html` | "A Remo está em todo lugar": um dia com a Remo e os 5 segmentos com as resinas indicadas |
| `contato.html` | Formulário por tipo de pedido, informações e FAQ |

Os endereços antigos (`materiais`, `institucional`, `como-trabalhamos`, `laboratorio`, `qualidade` e `guia`) redirecionam para as páginas novas. No fim de cada página há uma faixa com os números da Remo, uma esteira com as outras seções e o formulário de contato. O header fica visível o tempo todo, com o botão **SOBRE NÓS**.

## Identidade visual
- **Tipografia:** Archivo (títulos em largura expandida, textos em largura normal) + IBM Plex Mono (dados e rótulos)
- **Assinatura visual:** a molécula da logo (pontos e linhas) nos eyebrows, nos fundos escuros e no rastro do cursor
- **Paleta:** Marinho `#06112A` (base) · Navy `#001F5F` (só na logo) · Signal Yellow `#FFD100` (só destaque sobre o marinho) · Slate `#4A5468` · Steel `#A3ABBC` · Polymer White `#F4F5F7`
- **Movimento:** abertura com a logo na primeira visita, palavra que troca por sinônimos no título de cada abertura, transição com a logo entre páginas, rolagem suave (Lenis) e animações ligadas à rolagem (GSAP ScrollTrigger). Respeita "reduzir movimento" do sistema.
- **Texturas:** grão de filme animado, moléculas em baixo contraste nos fundos escuros e cotas técnicas em marinho nas seções brancas.
- **Imagens:** simuladas no Google Flow (hero, aberturas das páginas, cards, contato, linha do tempo, meio ambiente, dureza e segmentos). Serão trocadas por fotos reais.
- A logo usada é **provisória** (desenho aproximado); será trocada pelo SVG oficial.

## Como abrir
Abra `index.html` no navegador (não precisa de servidor). Use o botão **"Mostrar notas de UX"** na barra superior para ver as anotações.

## O que validar
1. Home como ponto de partida e os 6 cards de seções
2. Transição entre páginas
3. Destaque da certificação ISO (header, página Valores, rodapé)
4. Compromisso ambiental na página Valores
5. Régua de dureza na página Tecnologias
6. Metáfora "em todo lugar" na página Onde atuamos
7. Formulário de contato por tipo de pedido
8. Página de produto com fichas técnicas por grade

## Referências de método
Heurísticas de Nielsen e princípios de Don Norman, indicados nas notas azuis de cada seção.

## Pendências de conteúdo
- Razão social e CNPJ (footer)
- Número real da certificação ISO (no wireframe: **ISO 9001:2015\***, provisório)
- Certificado em PDF
- Dados ambientais reais (os números atuais são rascunho)
- Faixas de dureza e recursos de formulação validados pela equipe técnica
- Números adicionais (clientes, estados, capacidade)
- Logos de clientes e depoimento (com autorização)
- WhatsApp comercial
- Marcos de 2016 até hoje

Conteúdo de produtos extraído do site atual (remopolimeros.com.br).
