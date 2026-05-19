# TODO - Projeto Banco Digital (Kafka + DynamoDB + ElasticMQ)

## Passo 1
- [x] Criar estrutura do backend Node.js em `server/`
- [x] Implementar API REST: login, MFA, estado, alterar limite PIX, consignado, investimentos


## Passo 2
- [ ] Configurar DynamoDB local (dynamodb-local) e criar helpers para CRUD

## Passo 3
- [ ] Configurar Kafka via `docker-compose.yml`
- [ ] Implementar produtor de eventos e worker/consumer para enriquecer eventos

## Passo 4
- [ ] Configurar ElasticMQ (SQS local) via `docker-compose.yml`
- [ ] Implementar fila de notificações e worker para enviar notificações (simuladas)

## Passo 5
- [ ] Implementar autenticação (sessions) e MFA (OTP) persistidos no DynamoDB

## Passo 6
- [ ] Atualizar front (`index.html`, `script.js`, `style.css`) para dashboard do banco digital
- [ ] Implementar fluxo: login -> MFA -> dashboard -> alterar limite PIX -> exibir notificações/chat

## Passo 7
- [ ] Criar `README.md` com comandos para subir ambiente e testar fluxo

## Passo 8
- [ ] Rodar testes manuais: login/MFA, alterar limite PIX (inclui violação), visualização no dashboard

