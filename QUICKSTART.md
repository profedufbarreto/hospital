# 🚀 Guia Rápido de Inicialização

## Pré-requisitos
- **Node.js** v14+ instalado
- **MySQL** v5.7+ instalado e rodando
- **npm** ou **yarn**

## Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Criar Banco de Dados
```bash
mysql -u root -p < database/schema.sql
```
Quando pedido, coloque sua senha do MySQL (ou deixe em branco se for a padrão).

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Editar `.env` (ajuste se necessário):
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=hospital_db
```

### 4. Iniciar o Servidor

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará disponível em: **http://localhost:3000**

## Primeira Vez

1. Abra http://localhost:3000 no navegador
2. Use uma das credenciais padrão:
   - **Usuário:** `adm` | **Senha:** `adm`
   - **Usuário:** `root` | **Senha:** `root`
3. Você estará no dashboard com acesso total

## Estrutura Básica de Uso

### Dashboard
- Visualiza estatísticas dos módulos
- Exibe total de pacientes, provas de vida, medicações e usuários

### Prontuário Digital
- Registre novos pacientes (nome, data nascimento, CEP, endereço)
- CEP é preenchido automaticamente via ViaCEP

### Prova de Vida
- Registre sinais vitais (pressão, batimentos, SpO2, glicose)
- Especifique a hora e quem realizou

### Medicações
- Adicione medicações de uma lista padrão
- Marque se é necessária (S/N)
- Registre hora da administração

### Calculadora de Dosagens
- Conversão mg → ml
- Conversão para gotas
- Gotas por minuto
- Dose por peso
- Cálculo de IMC

### Gerenciar Usuários (Admin/Root apenas)
- Crie, edite ou delete usuários
- Atribua papéis (admin, technician, nurse)

## Comandos Úteis

### Verificar tabelas do BD
```bash
mysql -u root -p hospital_db -e "SHOW TABLES;"
```

### Ver estrutura de uma tabela
```bash
mysql -u root -p hospital_db -e "DESCRIBE patients;"
```

### Limpar pacientes (cuidado!)
```bash
mysql -u root -p hospital_db -e "DELETE FROM patients;"
```

### Resetar BD inteira
```bash
mysql -u root -p < database/schema.sql
```

## Troubleshooting

### "Port 3000 already in use"
Mude a porta em `.env`:
```
PORT=3001
```

### "Cannot connect to database"
```bash
# Verificar MySQL status
sudo service mysql status

# Reiniciar MySQL
sudo service mysql restart
```

### "Token inválido"
Limpe `localStorage` no navegador (F12 → Application → Local Storage → Limpar tudo) e faça login novamente.

### Permissão negada ao deletar usuário
- Usuários `adm` e `root` não podem ser deletados
- Técnico pode deletar anotações de enfermeiros
- Apenas admin/root podem gerenciar usuários

## Debug

### Ver logs do servidor
O terminal mostra logs em tempo real enquanto o servidor roda.

### Testar API com curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"adm","password":"adm"}'

# Listar pacientes
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer {TOKEN_AQUI}"
```

### DevTools (F12)
- **Network:** Ver requisições HTTP
- **Console:** Ver erros JavaScript
- **Application:** Ver localStorage (token)

## Próximas Etapas

1. **Customize Medicações:** Edite `database/schema.sql` para adicionar novas medicações
2. **Ative HTTPS:** Para produção, configure certificados SSL
3. **Implante:** Use Heroku, Railway, ou seu servidor próprio
4. **Backup:** Configure backups automáticos do BD

---

**Dúvidas?** Consulte `.github/copilot-instructions.md` para detalhes técnicos.
