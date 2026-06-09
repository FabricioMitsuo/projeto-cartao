# TODO - App Cartão + Face Login (AWS Rekognition)

## Planejamento aprovado
- [x] Levantar entendimento do repositório e UI atual (localStorage)
- [x] Confirmar que o objetivo é **Face Login direto** (sem OTP)

## Etapas de implementação
1. [ ] Criar tela de Face Login no `index.html/script.js` e bloquear dashboard até autenticar.
2. [ ] Implementar endpoint de sessão/face no backend (`server/src/index.js`) substituindo o MFA por Face Verified.
3. [ ] Criar service Rekognition (`server/src/services/rekognition.js`) com:
   - [ ] CreateCollection (1x, se necessário)
   - [ ] IndexFaces/Index (register)
   - [ ] SearchFacesByImage (verify)
4. [x] Criar endpoints de face:
   - [ ] `POST /api/face/register` (opcional para cadastrar)
   - [ ] `POST /api/face/verify` (fluxo de autenticação)

5. [ ] Atualizar persistência de cartões: substituir `localStorage` por endpoints REST e salvar em DynamoDB.
6. [ ] Garantir que o cartão fica **sempre visível** após autenticar (mas com mascaramento no UI).
7. [ ] Atualizar README com passo a passo AWS Rekognition.
8. [ ] Criar workflows do GitHub Actions (build/test).
9. [ ] Criar instruções “subir para GitHub” (passo a passo) e fluxo de dados no GitHub.

## Checklist de validação
- [ ] Rodar `docker compose up -d`
- [ ] Rodar backend `cd server && npm install && npm run dev`
- [ ] Testar Face Login (modo demo/mocked, se AWS não estiver configurado)
- [ ] Cadastrar cartão e listar do dashboard
- [ ] Disparar fluxo Pix limit (Kafka->SQS->notificações) mantendo conta/logado

