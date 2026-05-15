# 💳 Cartão de Crédito Interativo Inteligente

Este é um projeto de interface front-end realista e interativa de um cartão de crédito. Ele renderiza um cartão que simula efeitos físicos de relevo e luz através de CSS puro e utiliza JavaScript para criar dinamismo com um formulário de checkout em tempo real.

---

## 📸 Demonstração Visual

Aqui está o visual do cartão gerado pelo código:

### Face Frontal (Tema Visa)
![Frente do Cartão](https://unsplash.com)

### Face Traseira (Com Tarja e CVV)
![Verso do Cartão](https://unsplash.com)

> *Nota: Você pode substituir as imagens acima tirando um print da sua própria tela rodando o projeto no VS Code!*

---

## ✨ Funcionalidades

*   **Identificação de Bandeira Automática:** Altera o tema visual (gradiente de cores e logotipo) baseado no primeiro dígito digitado (Visa, Mastercard ou Elo).
*   **Efeito Flip em 3D:** O cartão vira automaticamente em uma rotação de 180° para exibir o verso quando o usuário foca no campo de digitação do CVV.
*   **Mascáras de Entrada:** Formatação em tempo real dos números (espaçamento de 4 em 4 dígitos) e data de validade (inserção automática da barra `/`).
*   **Design Responsivo e Fluido:** Estrutura limpa baseada em proporções reais de cartões de pagamento físicos.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web nativas, sem dependência de frameworks externos:

*   **HTML5:** Estruturação semântica dos dados da aplicação.
*   **CSS3:** Estilização com gradientes dinâmicos, sombras internas/externas e transformações 3D (`perspective` e `backface-visibility`).
*   **JavaScript (ES6):** Manipulação de eventos de formulário, lógica de expressões regulares (Regex) e controle de classes DOM.

---

## 🚀 Como Executar o Projeto

Para testar o projeto localmente no seu computador, siga os passos abaixo:

1. **Clone este repositório:**
   ```bash
   git clone https://github.com
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd projeto-cartao
   ```

3. **Abra o arquivo `index.html`:**
   * Você pode dar um duplo clique diretamente no arquivo `index.html`.
   * Ou, se estiver utilizando o **VS Code**, use a extensão **Live Server** para rodar um servidor local com atualização em tempo real.

---

## 📝 Estrutura de Arquivos

```text
projeto-cartao/
├── index.html     # Estrutura principal da página e formulário
├── style.css      # Estilização visual, efeitos 3D e temas dinâmicos
├── script.js      # Lógica de validação, máscaras e rotação
└── README.md      # Documentação do projeto
```

---

## 📄 Licença

Este projeto está sob ao Fabricio Mitsuo 
