# Remo Polímeros · Wireframe v4.6

Wireframe do novo site da Remo Polímeros para validar **usabilidade**, **navegação**, **onde fica cada informação** e a **identidade visual** antes de entrarem fotos reais.

**Link:** https://luizmiguelbastos.github.io/remo-polimeros-wireframe/
**Repositório:** luizMiguelBastos/remo-polimeros-wireframe (público, GitHub Pages)

---

## 1. Como trabalhar neste projeto (combinado com o Luiz)

- Seguir a skill `modo-direto`: responder só o que foi pedido, formato resposta literal > breve detalhamento, sem sugestões extras.
- **Nada é executado sem pedido explícito** ("aplique", "faça", "pode gerar"). Feedback, comentário ou pergunta não é ordem: responder e perguntar se pode aplicar.
- Quando o pedido for "valide" ou "me dê ideias", **não aplicar**: mostrar opções ou prévia e esperar a escolha.
- **Publicar (commit + push) só depois de "Sim, enviar".** Sempre perguntar antes de enviar ao GitHub Pages.
- Antes de apagar arquivos, perguntar (mesmo arquivos sem uso).
- Testar no desktop (1440 px e outras larguras) e no celular (375 a 390 px), checar console e rolagem lateral. Quando houver dúvida de renderização, testar no Chrome real do Luiz (extensão Claude in Chrome).
- A cada versão, trocar `?v=X.Y` nos links de CSS, JS e data.js e o rótulo "WIREFRAME vX.Y" para furar o cache do navegador.
- README só muda quando o Luiz pedir.
- Mensagem de commit termina com: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## 2. Regras fixas de conteúdo e estilo

- **Sem travessões** (— ou –) em nenhum texto do site.
- **Sem degradês luminosos amarelos ou azuis.** Degradês escuros (preto/marinho) são permitidos.
- **Nada de azul vivo nos detalhes.** O azul `#2A5BD7` foi reprovado. Azul só na logo (Navy) e na cor base.
- Botões **sem caixa alta** (caps lock reprovado).
- Amarelo `#FFD100` nunca como texto sobre fundo claro; é cor de destaque sobre o escuro.

## 3. Identidade visual atual

- **Tipografia:** Archivo (títulos em largura expandida 125%, peso 600) + IBM Plex Mono (rótulos e dados). Montserrat + Poppins foram testadas e **reprovadas**.
- **Cor base:** `#0F1626` (azul-marinho acinzentado). Histórico: preto, `#06112A`, `#030812`, `#01040A` foram reprovados por ficarem muito azuis ou muito escuros.
- **Paleta:** base `#0F1626` · superfície `#172034` · Signal Yellow `#FFD100` · Slate `#4A5468` · Steel `#A3ABBC` · Polymer White `#F4F5F7` · Ink `#0B1220` · Navy da logo `#13185A`.
- **Assinatura:** a molécula (símbolo da Remo) nos rótulos das seções, nos fundos (pontos e linhas em amarelo e azul que se conectam ao cursor), no rastro do cursor e nas transições.
- **Texturas:** grão de filme animado, papel pontilhado nas seções brancas, moléculas em baixo contraste, cotas técnicas finas nas seções brancas.
- **Botões:** largura mínima 170 px, cantos 8 px, preenchimento que desliza no hover (amarelo), seta que entra e sai, efeito magnético.

## 4. Logo

- Símbolo vetorizado em `assets/logo/` (construção: triângulo amarelo arredondado ao fundo, só contorno; triângulo azul arredondado na frente, miolo transparente; um círculo centrado em cada vértice do azul, tamanhos diferentes).
  - `remo-simbolo.svg` colorido (fundo claro: abertura, transição, favicon, footer)
  - `remo-simbolo-branco.svg` branco com amarelo (header)
  - `remo-simbolo-mono.svg` uma cor (máscara dos rótulos das seções)
  - `remo-simbolo-contorno.svg` **sem uso** (opção reprovada)
- Gerador: script Python que monta os 3 SVGs (no scratchpad da sessão; refazer a partir da construção acima se precisar).
- No header: símbolo branco com amarelo + "remo" (sem "polímeros").
- **Reprovado no header:** símbolo colorido, azul mais claro, contorno branco nos círculos, selo diagonal (chapado ou vidro), faixa de vidro na altura do header, faixa adaptativa por luminosidade, header claro.

## 5. Estrutura das páginas

| Página | Conteúdo |
|---|---|
| `index.html` | Hero principal, "Escolha por onde começar" (6 cards), números, esteira, contato |
| `produtos.html` | Índice de 9 linhas (abre ao clicar, hover com fundo que sobe) e comparador de duas linhas |
| `produto.html?linha=abs` | Página de cada linha (abs, abs-pc, asa, pbt, pc, pc-compostos, pmma, pom, san) |
| `historia.html` | Manifesto palavra a palavra, parallax, números, linha do tempo com fotos, depoimento |
| `valores.html` | Missão, visão, 10 valores, compromisso ambiental (números de rascunho), ISO 9001:2015* |
| `tecnologias.html` | Laboratório de cores, dureza sob medida (régua Shore ligada à rolagem), 4 etapas |
| `onde-atuamos.html` | "Um dia com a Remo" (horas que acendem) e 5 segmentos com resinas |
| `contato.html` | Formulário por tipo de pedido, contatos e FAQ |

- Endereços antigos (`materiais`, `institucional`, `como-trabalhamos`, `laboratorio`, `qualidade`, `guia`) redirecionam.
- Fim de cada página: faixa de números (37 anos, 9 linhas, 1 dia, ISO) → esteira horizontal "Para onde agora?" com as outras seções e a home → contato → footer.

## 6. Componentes aprovados (estado atual)

**Header:** vidro escuro translúcido, sempre visível (não some ao rolar), nome da seção atual ao lado de "remo" ("— Home" no topo da home), alinhado opticamente ao centro de "remo". Um único botão "Sobre nós →".

**Hero principal (home)** — não mexer na tipografia e organização, aprovado:
- Tudo à esquerda: rótulo, título em duas linhas ("Polímeros de engenharia," menor em branco + "feitos sob medida." grande em amarelo), traço amarelo 64×4 px, texto explicativo completo (largura igual à linha grande), botões "Sobre nós" e "Nossos produtos".
- Palavra que troca a cada 3 s: sob medida, para você, personalizados, com precisão, do seu jeito. Linha nunca quebra no desktop; troca não acumula palavras.
- Traço amarelo se desenha na entrada e estica até 96 px a cada troca.
- "Explore" (tracinho com segmento amarelo descendo) à direita, centralizado na altura do texto explicativo; some ao rolar. **Reprovados:** cápsula de mouse, seta em cápsula de vidro.
- Indicador de setores no canto superior direito: número, nome e barra amarela de tempo, com sombra escura bem sutil.
- Fotos: 5 fotos de **processos com pessoas sem perder o ambiente** (laboratório de cores, extrusão, ensaios, dosagem, expedição), troca a cada 8 s, não pausa no hover, zoom quase imperceptível (103% → 100%), parallax sutil com o mouse.
- Degradê **preto** só na base da foto + sombra escura suave atrás do bloco de texto. Degradê lateral reprovado.

**Aberturas internas (todas as páginas menos a home):** mesmo padrão do hero principal (rótulo com o nome da página, linha menor branca + linha grande amarela com palavra que troca, traço, texto, "Explore" à direita na altura do texto). Padrão "palavra grande à esquerda + texto à direita" foi **reprovado**.

**Transições entre páginas:** folha branca com papel pontilhado, símbolo + "remo" gigante no canto inferior esquerdo, frase de apoio e nome do destino, moléculas amarelas e azuis se mexendo. **Sem animação nas letras.** Nenhuma transição em azul escuro (a folha aparece antes do JS via classe `tx-in` no `<head>`). Abertura da primeira visita segue o mesmo visual.

**"Escolha por onde começar":** fundo branco com papel pontilhado e moléculas, título com quadradinho amarelo e linha marinho "06 seções", sem subtítulo; cards escuros com foto no topo, sem borda, entrada em cascata com a foto revelando como cortina, colunas em velocidades diferentes ao rolar. Letreiro gigante ao fundo foi **reprovado**.

**Footer:** branco; topo com símbolo + "remo" grande, frase e botão; 4 colunas (Empresa, Navegue, Contato, Endereço); linha final. Sem ISO e LG Chem.

## 7. Imagens (Google Flow)

- Geradas no Flow (projeto `509da539-9750-4b16-9d3c-a0bc2c96e240`), 16:9, Nano Banana Pro, 1 por vez, pelo Chrome do Luiz.
- **Nunca pedir "darker empty area on the left"** no prompt: o Flow cria uma faixa escura reta na lateral. Usar "even, balanced lighting across the whole frame, no vignette, no dark overlay on any side".
- Depois de baixar, checar faixa escura (script com Pillow) e conferir numa folha de contato.
- Comprimir com `sips` (qualidade 76 a 78) em `assets/hero/` e `assets/img/`.
- Fotos do hero em uso: `p1-laboratorio`, `p2-extrusao`, `p3-ensaios`, `p4-dosagem`, `p5-expedicao`. As outras de `assets/hero/` estão **sem uso**.

## 8. Pendências de conteúdo

- Razão social e CNPJ (footer)
- Número real da certificação ISO (no wireframe: ISO 9001:2015\*, provisório) e certificado em PDF
- Dados ambientais reais (números atuais são rascunho)
- Faixas de dureza validadas pela equipe técnica
- Números adicionais, logos de clientes e depoimento autorizado, WhatsApp comercial, marcos de 2016 em diante
- Arquivo oficial da marca (AI/PDF/EPS), se existir, substitui o símbolo vetorizado

## 9. Pontos conhecidos

- Botão "Fale com um especialista" do footer está branco sobre branco (não corrigido, aguardando pedido).
- Botão longo da página de produto passa da largura no celular (não corrigido).
- Arquivos sem uso: fotos antigas em `assets/hero/` e `remo-simbolo-contorno.svg` (não apagados).

## Como abrir

Abra `index.html` no navegador ou rode um servidor local na porta 8765. Use **"Mostrar notas de UX"** na barra superior para ver as anotações.

Conteúdo de produtos extraído do site atual (remopolimeros.com.br).
