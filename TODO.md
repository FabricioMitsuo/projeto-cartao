# TODO - Cartão: conta corrente + limite fictício + mensagem de excedeu

- [x] Atualizar `index.html`:
  - [x] Inserir campos no cartão: **Conta Corrente** e **Limite** (inicial 50.000)
  - [x] Inserir campo e botão para **Investir** (valor do investimento)
  - [x] Inserir alerta/CTA oculto inicialmente: **limite excedeu... aumentar limite**
- [x] Atualizar `script.js`:
  - [x] Ao salvar cartão, persistir também `account` (conta corrente) e `limit`
  - [x] Ao carregar cartões, renderizar conta/limite na UI (lista + cartão ativo)
  - [x] Implementar lógica: Investir > limite => mostrar alerta + bloquear investimento
  - [x] Implementar CTA “Aumentar limite”: aumentar por um valor fixo (ex.: +50.000) e liberar investimento
- [x] Atualizar `style.css`:
  - [x] Estilos para novos campos e alerta de limite excedido
- [ ] Testar no navegador:
  - [ ] Salvar cartão e verificar conta corrente + limite
  - [ ] Investir com valor acima do limite => mensagem + CTA
  - [ ] Clicar aumentar limite => investimento permitido

