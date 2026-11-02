# Remo Polímeros · Wireframe v1.2

Wireframe do novo site da Remo Polímeros para validar **usabilidade**, **navegação**, **onde fica cada informação** e a **identidade visual** antes de entrarem fotos reais, vídeos e os movimentos finais.

**Link:** https://luizmiguelbastos.github.io/remo-polimeros-wireframe/

## Estrutura (v1.2)
A home é um ponto de partida: hero com fotos dos setores alternando, dois botões (**Conheça a Remo** e **Com o que trabalhamos**) e 6 cards, um para cada seção. Cada seção é uma página própria.

| Página | Conteúdo |
|---|---|
| `index.html` | Hero com fotos dos setores alternando, cards "Escolha por onde começar" e contato |
| `produtos.html` | Guia de seleção (tabela por segmento e exigência) e índice de resinas que abre ao clicar, com card 3D seguindo o cursor |
| `produto.html?linha=abs` | Página de cada linha (troque `abs` por `abs-pc`, `asa`, `pbt`, `pc`, `pc-compostos`, `pmma`, `pom` ou `san`) |
| `historia.html` | Manifesto, faixa em parallax, números, linha do tempo com fotos e depoimento |
| `valores.html` | Missão, visão e valores, compromisso ambiental e certificação ISO 9001:2015* |
| `tecnologias.html` | Laboratório de cores, dureza sob medida (régua Shore ligada à rolagem) e as 4 etapas de desenvolvimento |
| `onde-atuamos.html` | "A Remo está em todo lugar": um dia com a Remo e os 5 segmentos com as resinas indicadas |
| `contato.html` | Formulário por tipo de pedido, informações e FAQ |

Os endereços antigos (`materiais`, `institucional`, `como-trabalhamos`, `laboratorio`, `qualidade` e `guia`) redirecionam para as páginas novas. O formulário de contato aparece no fim de todas as páginas.

## Identidade visual
- **Tipografia:** Archivo (títulos em largura expandida, textos em largura normal) + IBM Plex Mono (dados técnicos)
- **Paleta:** Preto `#000000` (base) · Navy `#001F5F` (logo e detalhes nas seções brancas) · Signal Yellow `#FFD100` (só destaque sobre o preto) · Slate `#4A5468` · Steel `#A3ABBC` · Polymer White `#F4F5F7`
- **Movimento:** abertura com a logo na primeira visita, transição com a logo entre páginas, rolagem suave (Lenis) e animações ligadas à rolagem (GSAP ScrollTrigger). Respeita "reduzir movimento" do sistema.
- **Texturas:** grão de filme, grade técnica nos fundos escuros e papel pontilhado nos claros.
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
