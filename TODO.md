# TODO - Dashboard Conta Corrente + Pix + Investimentos + Extrato + Notificações (Web + Flutter)

- [x] Card: conta corrente + limite fictício 50.000 + mensagem de excedeu + CTA aumentar limite

## Web (index.html + script.js + style.css)
- [ ] Criar UI de **app** dentro do web com **abas**: Conta Corrente / Pix / Investimentos / Extrato / Notificações
- [ ] Conectar abas a endpoints reais quando existir backend:
  - [ ] `GET /api/state` para saldo/limite/investimentos
  - [ ] `POST /api/pix/limit` para alterar limite Pix
  - [ ] `POST /api/investments` para registrar investimentos
- [ ] Implementar seções UI (mock quando endpoint não existir):
  - [ ] Criar chave-pix
  - [ ] Contatos Pix
  - [ ] Pix cola
  - [ ] QR Pix
- [ ] Implementar Extrato detalhado (demo inicial e hook para endpoint real depois)
- [ ] Implementar Notificações (buscar lista quando existir; demo atual se necessário)

## Flutter (mobile passo a passo)
- [ ] Criar projeto Flutter em `mobile/`
- [ ] Implementar telas equivalentes às abas (com services prontos)
- [ ] Consumir backend (quando estiver disponível) via HTTP

## Testes
- [ ] Rodar backend e garantir que a UI web carrega `/api/state`
- [ ] Validar fluxo limite excedeu / aumentar limite
- [ ] Validar Pix limit update

