# Testes - Sistema de Prontuário Eletrônico

## Testes de API com cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"adm","password":"adm"}'

# Resposta esperada:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "username": "adm",
#     "name": "Administrador",
#     "role": "admin"
#   }
# }
```

### 2. Obter Pacientes (com token)
```bash
TOKEN="seu_token_aqui"

curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
# [
#   {
#     "id": 1,
#     "first_name": "João",
#     "last_name": "Silva",
#     ...
#   }
# ]
```

### 3. Registrar Novo Paciente
```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "dateOfBirth": "25-12-1990",
    "cep": "01000000",
    "street": "Rua Augusta",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "houseNumber": "1000",
    "admissionDate": "10-11-2025",
    "admissionTime": "14:30"
  }'
```

### 4. Calculadora de Dosagens
```bash
TOKEN="seu_token_aqui"

# mg para ml
curl -X POST http://localhost:3000/api/dosage-calculator/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "mg-to-ml",
    "params": {
      "mg": 500,
      "concentration": 250
    }
  }'

# Resposta: {"success": true, "result": "2.00"}
```

### 5. Gotas por Minuto
```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3000/api/dosage-calculator/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "drops-per-minute",
    "params": {
      "totalVolume": 500,
      "totalTime": 60,
      "dropsPerMl": 20
    }
  }'

# Resposta: {"success": true, "result": "167"}
```

### 6. Listar Medicações Padrão
```bash
TOKEN="seu_token_aqui"

curl -X GET http://localhost:3000/api/medications/standard/list \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
# [
#   {"id": 1, "name": "Dipirona", "unit": "mg"},
#   {"id": 2, "name": "Amoxicilina", "unit": "mg"},
#   ...
# ]
```

## Verificações Manuais

### Verificar Banco de Dados
```sql
-- Ver tabelas criadas
SHOW TABLES;

-- Ver usuários cadastrados
SELECT id, username, name, role FROM users;

-- Ver pacientes
SELECT * FROM patients;

-- Ver sinais vitais
SELECT * FROM vital_signs;

-- Ver medicações
SELECT * FROM medications;

-- Ver medicações padrão
SELECT * FROM standard_medications;
```

### Verificar Permissões

Testar acesso não autorizado:
```bash
# Tentar acessar /api/users sem ser admin
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {nurse_token}"

# Resposta esperada: 403 Forbidden
```

## Testes de Funcionalidade

### Frontend

1. **Login**
   - [ ] Abrir http://localhost:3000
   - [ ] Fazer login com `adm/adm`
   - [ ] Verificar se redireciona para dashboard
   - [ ] Tentar login com senha errada (deve falhar)

2. **Criar Paciente**
   - [ ] Clicar em "Prontuário Digital"
   - [ ] Clicar em "+ Novo Paciente"
   - [ ] Preencher CEP (ex: 01000000)
   - [ ] Verificar se CEP auto-completa via ViaCEP
   - [ ] Preencher restante dos dados
   - [ ] Clicar "Salvar Paciente"
   - [ ] Verificar se paciente aparece na tabela

3. **Registrar Prova de Vida**
   - [ ] Clicar em "Prova de Vida"
   - [ ] Selecionar paciente criado
   - [ ] Preencher sinais vitais
   - [ ] Clicar "Salvar Prova"
   - [ ] Verificar se aparece na tabela

4. **Adicionar Medicação**
   - [ ] Clicar em "Medicações"
   - [ ] Selecionar paciente
   - [ ] Escolher medicação da lista
   - [ ] Marcar se é necessária
   - [ ] Clicar "Salvar Medicação"
   - [ ] Verificar se aparece na tabela

5. **Calculadora de Dosagens**
   - [ ] Clicar em "Calculadora de Dosagens"
   - [ ] Testar "mg para ml": 500mg ÷ 250 = 2ml
   - [ ] Testar "gotas por minuto": 500ml em 60min = 167 gotas/min
   - [ ] Testar "dose por peso": 70kg × 10mg/kg = 700mg
   - [ ] Testar "IMC": 70kg / (1.75m)² = 22.86

6. **Gerenciar Usuários (Admin)**
   - [ ] Clicar em "Gerenciar Usuários"
   - [ ] Clicar "+ Novo Usuário"
   - [ ] Preencher dados de novo usuário (papel: Enfermeiro)
   - [ ] Clicar "Salvar Usuário"
   - [ ] Verificar se aparece na tabela
   - [ ] Fazer logout
   - [ ] Fazer login com novo usuário
   - [ ] Verificar se não vê "Gerenciar Usuários" (apenas enfermeiro)

7. **Permissões de Enfermeiro**
   - [ ] Fazer login como enfermeiro
   - [ ] [ Deve poder ver e criar pacientes
   - [ ] [ Deve poder registrar sinais vitais
   - [ ] [ Deve poder adicionar medicações
   - [ ] [ NÃO deve poder deletar informações
   - [ ] [ NÃO deve poder gerenciar usuários

## Performance

### Tempos Esperados

| Ação | Tempo Esperado |
|------|---|
| Login | < 500ms |
| Listar Pacientes | < 1s |
| Criar Paciente | < 1s |
| Lookup CEP | < 2s (ViaCEP) |
| Cálculo de Dosagem | < 100ms |
| Calculadora IMC | < 100ms |

## Checklist de Qualidade

- [ ] Todas as rotas retornam JSON válido
- [ ] Tokens JWT expiram em 24h
- [ ] Middleware de autenticação está funcionando
- [ ] Verificação de permissões está correta
- [ ] CEP lookup com ViaCEP funciona
- [ ] Calculadora realiza cálculos corretos
- [ ] Campos obrigatórios são validados
- [ ] Erros são tratados corretamente
- [ ] Não há exposição de dados sensíveis (senhas)
- [ ] CORS está configurado corretamente
- [ ] Banco de dados persiste dados corretamente

## Problemas Conhecidos

### Port Already in Use
Se porta 3000 já está em uso:
```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta em .env
PORT=3001
```

### JWT Token Invalid
Causas:
- Token expirou (24h)
- Chave secreta mudou em `.env`
- Token foi corrompido

Solução: Limpar localStorage e fazer login novamente

### Dados não aparecem
Causas:
- Banco de dados não foi inicializado
- Permissão insuficiente para visualizar dados

Verificação:
```bash
mysql -u root -p hospital_db -e "SELECT * FROM patients;"
```
