# Remo Polímeros · Wireframe v0.9

Wireframe do novo site da Remo Polímeros para validar **usabilidade**, **navegação**, **onde fica cada informação** e a **identidade visual** antes de entrarem imagens, vídeos e os movimentos finais.

**Link:** https://luizmiguelbastos.github.io/remo-polimeros-wireframe/

## Estrutura (v0.9)
A home é um ponto de partida: hero com breve introdução e dois botões (**Conheça a Remo** e **Com o que trabalhamos**), seguido de cards para cada seção. Cada seção é uma página própria.

| Página | Conteúdo |
|---|---|
| `index.html` | Hero e cards "Explore a Remo" |
| `institucional.html` | Manifesto, números, missão, visão, valores, linha do tempo e depoimento |
| `materiais.html` | Índice de resinas que abre ao clicar, com card 3D seguindo o cursor |
| `produto.html?linha=abs` | Página de cada linha (troque `abs` por `abs-pc`, `asa`, `pbt`, `pc`, `pc-compostos`, `pmma`, `pom` ou `san`) |
| `como-trabalhamos.html` | As 4 etapas em esteira horizontal |
| `laboratorio.html` | Página informativa: prazo, efeitos especiais, equipamentos, padrões e aditivos |
| `guia.html` | Tabela de resinas indicadas por segmento e exigência |
| `qualidade.html` | Certificação ISO, Política da Qualidade, parceria LG Chem e rastreabilidade |
| `contato.html` | Formulário por tipo de pedido, informações e FAQ |

## Identidade visual
- **Tipografia:** Archivo (títulos em largura expandida, textos em largura normal) + IBM Plex Mono (dados técnicos)
- **Paleta:** Night `#050B1A` · Navy `#001F5F` (só na logo) · Signal Yellow `#FFD100` (só destaque) · Slate `#4A5468` · Steel `#A3ABBC` · Polymer White `#F4F5F7`
- **Movimento:** abertura com a logo na primeira visita, transição com a logo entre páginas, rolagem suave (Lenis) e animações ligadas à rolagem (GSAP ScrollTrigger). Respeita "reduzir movimento" do sistema.
- **Texturas:** grão de filme, grade técnica nos fundos escuros e papel pontilhado nos claros.
- A logo usada é **provisória** (desenho aproximado); será trocada pelo SVG oficial.

## Como abrir
Abra `index.html` no navegador (não precisa de servidor). Use o botão **"Mostrar notas de UX"** na barra superior para ver as anotações.

## O que validar
1. Home como ponto de partida e os cards de seções
2. Transição entre páginas
3. Destaque da certificação ISO (header, hero, página Qualidade, rodapé)
4. Tabela do guia de seleção
5. Página informativa do laboratório
6. Formulário de contato por tipo de pedido
7. Página de produto com fichas técnicas por grade

## Referências de método
Heurísticas de Nielsen e princípios de Don Norman, indicados nas notas azuis de cada seção.

## Pendências de conteúdo
- Número real da certificação ISO (no wireframe: **ISO 9001:2015\***, provisório)
- Certificado em PDF
- Números adicionais (clientes, estados, capacidade)
- Logos de clientes e depoimento (com autorização)
- WhatsApp comercial
- Marcos de 2016 até hoje

Conteúdo de produtos extraído do site atual (remopolimeros.com.br).
