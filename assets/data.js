// Conteúdo extraído do site atual (remopolimeros.com.br): linhas de produto
// "props" alimenta os filtros do guia de seleção.
window.REMO_MATERIALS = [
  {
    id: "abs", name: "ABS", full: "Acrilonitrila Butadieno Estireno",
    desc: "Plástico altamente funcional, conhecido pela resistência ao impacto e resistência térmica. Fácil processabilidade, fabricado em várias cores, com aditivação para intempéries, anti-chama, reforço com fibra de vidro e outros.",
    apps: ["Interior/exterior de automóveis", "Compartimento de geladeira", "Fotocopiadora", "Aspirador de pó"],
    traits: ["Durabilidade", "Excelente processabilidade", "Cores diversas", "Excelente resistência ao impacto", "Boa resistência à temperatura"],
    segments: ["automotivo", "linha-branca", "eletro"],
    props: ["impacto", "chama", "uv", "temperatura"],
    grades: [
      ["ABS RM 324 HF", "Alto fluxo, retardante de chama. Atende à Diretiva RoHS."],
      ["ABS RM 380", "Alto fluxo. Elétricos e eletrônicos, brinquedos e diversos."],
      ["ABS RM 404", "Alta temperatura. Peças internas e externas automotivas."],
      ["ABS RM 749 LG", "Baixo brilho / alta temperatura. Interior de automóveis."],
      ["ABS RM 121 V0", "Alto impacto, retardante de chama. Atende à Diretiva RoHS."],
      ["ABS RM 221", "Alto impacto, baixo brilho. Chapas, automotivo."],
      ["ABS RM 350UV", "Alto fluxo, alto brilho, resistente a intempéries."]
    ],
    sheets: 14
  },
  {
    id: "abs-pc", name: "ABS-PC", full: "Composto de ABS e Policarbonato",
    desc: "Plástico de engenharia que combina alto impacto, alta rigidez e excelente resistência à temperatura. Fabricado em diversos teores de PC e ABS, com resistência a intempéries, anti-chama, reforçado e outros.",
    apps: ["Interior e exterior de automóveis", "Eletroeletrônicos", "Celulares"],
    traits: ["Excelente propriedade mecânica", "Excelente propriedade térmica", "Cores diversas", "Excelente resistência ao impacto"],
    segments: ["automotivo", "eletro"],
    props: ["impacto", "chama", "temperatura"],
    grades: [
      ["ABS-PC RM 500 MP", "Injeção e cromação. Peças internas e externas de automóveis."],
      ["ABS-PC RM5001 FR", "Retardante de chama, halogênio free. Elétricos e eletrônicos."],
      ["ABS-PC RM5007FM V0", "Retardante de chama, halogênio free. Peças técnicas."]
    ],
    sheets: 4
  },
  {
    id: "asa", name: "ASA", full: "Acrilonitrila Estireno Acrilato",
    desc: "Copolímero com excelente resistência às intempéries, mantendo a maioria das vantagens do ABS. Ótima retenção de propriedades físicas ao ar livre.",
    apps: ["Retrovisores automotivos", "Grade de radiador", "Perfil de janelas", "Pisos", "Telhas"],
    traits: ["Excelente resistência às intempéries", "Excelente processabilidade", "Resistência química", "Boa resistência ao impacto"],
    segments: ["automotivo", "construcao"],
    props: ["uv", "impacto", "quimica"],
    grades: [
      ["ASA RM 913 UV", "Boa resistência ao impacto e a intempéries. Peças elétricas, molduras."],
      ["RECOEX RM 913 HF UV", "Extrusão, resistente a intempéries. Chapas, perfis, telhas."],
      ["ASA RM 941 UV", "Alta temperatura, resistente a intempéries. Automotivo."]
    ],
    sheets: 3
  },
  {
    id: "pbt", name: "PBT e Compostos", full: "Polibutileno Tereftalato",
    desc: "Resistência à fadiga, propriedades elétricas, boa rigidez e tração. Pode ser composto com ABS, PET, PC e outros, reforçado com fibra de vidro e aditivado para chama e intempéries.",
    apps: ["Conectores", "Maçaneta automotiva", "Moldura de farol", "Interruptores"],
    traits: ["Excelentes propriedades térmicas e mecânicas", "Excelente propriedade elétrica", "Boa resistência ao impacto e temperatura"],
    segments: ["automotivo", "eletro"],
    props: ["temperatura", "chama", "rigidez", "uv"],
    grades: [
      ["PBT RM 300 FV30", "Alta temperatura, 30% fibra de vidro. Peças automotivas."],
      ["PBT-PET RM 5000 UV FV30", "Fibra de vidro, resistente a intempéries."],
      ["PBT RM 2306F V0", "Reforçado, retardante de chama. Elétricos e eletrônicos."]
    ],
    sheets: 5
  },
  {
    id: "pc", name: "PC", full: "Policarbonato",
    desc: "Polímero rígido e transparente, com excelente equilíbrio entre impacto, alta resistência térmica, transparência e estabilidade dimensional.",
    apps: ["Peças automotivas", "Eletroeletrônicos e celulares", "Registros", "Caixas de energia"],
    traits: ["Excelente propriedade mecânica", "Excelente propriedade térmica", "Cores diversas", "Excelente resistência ao impacto"],
    segments: ["automotivo", "eletro", "construcao"],
    props: ["transparencia", "impacto", "temperatura", "uv"],
    grades: [
      ["PC RM 106U", "Propósitos gerais, resistência a UV. Elétricos e eletrônicos."],
      ["PC RM 122U", "Ficha técnica disponível."],
      ["PC RM 110U", "Ficha técnica disponível."],
      ["PC RM 1006F-UV", "Ficha técnica disponível."]
    ],
    sheets: 4
  },
  {
    id: "pc-compostos", name: "PC e Compostos", full: "Blendas de Policarbonato",
    desc: "Blendas PC/PBT, PC/PET, PC/ASA e PC/ABS em diversas concentrações, reforçadas com fibra de vidro, anti-chama ou resistentes a intempéries.",
    apps: ["Peças automotivas", "Eletroeletrônicos e celulares", "Saída de ar-condicionado automotiva"],
    traits: ["Excelente propriedade mecânica", "Excelente propriedade térmica", "Cores diversas", "Excelente resistência ao impacto"],
    segments: ["automotivo", "eletro"],
    props: ["temperatura", "impacto", "uv", "chama"],
    grades: [
      ["ASA-PC RM 615", "Alta temperatura, alto impacto, intempéries. Automotivo externo."],
      ["ASA-PC RM 720", "Alta temperatura, alto impacto. Uso externo e interno."],
      ["PC-PBT RM 50 FV10", "10% fibra de vidro. Peças internas e externas automotivas."]
    ],
    sheets: 4
  },
  {
    id: "pmma", name: "PMMA", full: "Polimetilmetacrilato (acrílico)",
    desc: "Material de alta dureza, rígido e transparente, com excelente resistência às intempéries em relação à maioria dos termoplásticos.",
    apps: ["Lanternas automotivas", "Giroflex", "Painéis e chapas de proteção", "Janelas de inspeção"],
    traits: ["Excelente resistência a intempéries", "Boa resistência térmica", "Cores diversas", "Resistência química e ao risco"],
    segments: ["automotivo", "eletro", "embalagens"],
    props: ["transparencia", "uv", "risco", "dureza"],
    grades: [
      ["PMMA RM 830", "Alta temperatura, injeção. Lentes automotivas."],
      ["PMMA RM 844M", "Alto fluxo. Embalagens, eletroeletrônicos, automotivo."],
      ["PMMA RM 855HI", "Alto fluxo. Automotivo, eletroeletrônicos."]
    ],
    sheets: 5
  },
  {
    id: "pom", name: "POM", full: "Polioximetileno (acetal)",
    desc: "Elevada rigidez, tenacidade, estabilidade dimensional, resistência à fadiga e ao creep, e excelente resistência à abrasão.",
    apps: ["Engrenagens", "Válvulas", "Interruptores", "Peças de máquinas de lavar"],
    traits: ["Excelente resistência à abrasão", "Fácil processabilidade", "Cores diversas"],
    segments: ["automotivo", "linha-branca"],
    props: ["rigidez", "abrasao", "quimica"],
    grades: [
      ["POM RM 102", "Resistência química, propósitos gerais."],
      ["POM RM 109 LD", "Resistência química, propósitos gerais."]
    ],
    sheets: 2
  },
  {
    id: "san", name: "SAN", full: "Estireno Acrilonitrila",
    desc: "Excelente transparência e brilho, resistente a impacto e a produtos químicos.",
    apps: ["Prateleiras de geladeira", "Ventiladores", "Potes de alimentos", "Embalagens cosméticas"],
    traits: ["Excelente transparência", "Excelente processabilidade", "Cores diversas", "Excelente resistência química"],
    segments: ["linha-branca", "embalagens"],
    props: ["transparencia", "quimica"],
    grades: [
      ["SAN RM 250", "Alta transparência e rigidez, levemente azulado."],
      ["SAN RM 550", "Alta transparência e rigidez, transparente."]
    ],
    sheets: 2
  }
];
