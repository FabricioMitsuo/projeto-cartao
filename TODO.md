# TODO - Transformar em React Native (Expo)

## Passo 1
- [ ] Criar uma nova pasta `mobile/` com projeto **Expo (React Native)**
- [ ] Configurar estrutura `src/` (screens, api client, auth state)

## Passo 2
- [ ] Implementar fluxo Login + MFA
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/mfa/verify`
  - [ ] Guardar `sessionId` no estado (ex: AsyncStorage)

## Passo 3
- [ ] Implementar Dashboard
  - [ ] `GET /api/state` com `Authorization: Bearer <sessionId>`

## Passo 4
- [ ] Implementar tela/ação de Alterar limite PIX
  - [ ] `POST /api/pix/limit` com `newLimit`

## Passo 5
- [ ] (Opcional) Adicionar endpoints no backend para listar notificações/chat
  - [ ] `GET /api/notifications`
  - [ ] `GET /api/chat`
  - [ ] Tornar fallback `state.notifications` consumível

## Passo 6
- [ ] Rodar e testar localmente
  - [ ] Backend: `npm run dev` no `server/`
  - [ ] Mobile: `expo start` no `mobile/`

