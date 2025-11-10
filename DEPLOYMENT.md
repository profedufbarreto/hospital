# 🚀 Deployment e Produção

## Preparação para Produção

### 1. Atualizar Segurança

#### ✅ Mudar SHA-256 para bcryptjs

No arquivo `backend/controllers/authController.js`:

```javascript
// Antes (inseguro):
const crypto = require('crypto');
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Depois (seguro):
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};
```

### 2. Configurar Variáveis de Ambiente

Criar arquivo `.env` para produção:

```
PORT=3000
NODE_ENV=production

DB_HOST=seu-host-db.com
DB_USER=usuario_prod
DB_PASSWORD=senha_super_segura
DB_NAME=hospital_prod
DB_PORT=3306

JWT_SECRET=chave_secreta_super_longa_aleatorio_minimo_32_caracteres
JWT_EXPIRES_IN=24h

CORS_ORIGIN=https://seu-dominio.com
```

### 3. Usar HTTPS em Produção

```javascript
// No server.js - adicionar SSL
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/caminho/para/chave-privada.pem'),
  cert: fs.readFileSync('/caminho/para/certificado.pem')
};

https.createServer(options, app).listen(PORT);
```

## Deployment em Plataformas

### 🟢 Heroku

1. **Instalar CLI:**
```bash
npm install -g heroku
heroku login
```

2. **Criar app:**
```bash
heroku create seu-app-hospital
```

3. **Configurar variáveis:**
```bash
heroku config:set DB_HOST=seu-db.com
heroku config:set JWT_SECRET=sua-chave-secreta
```

4. **Deploy:**
```bash
git push heroku main
```

### 🔵 Railway

1. **Conectar repositório:**
   - Ir em https://railway.app
   - Conectar GitHub
   - Selecionar repositório

2. **Configurar variáveis:**
   - Ir em Variables
   - Adicionar todas do `.env`

3. **Adicionar banco de dados:**
   - Clicar "Add Service"
   - Escolher "MySQL"

### ⚫ DigitalOcean

1. **Criar Droplet:**
   - Ubuntu 20.04 LTS
   - Mínimo: 2GB RAM, 1 CPU

2. **Instalar dependências:**
```bash
ssh root@seu-ip
apt update && apt upgrade -y
apt install nodejs npm mysql-server -y
```

3. **Clonar projeto:**
```bash
git clone seu-repo.git
cd hospital
npm install
```

4. **Configurar PM2 (sempre rodando):**
```bash
npm install -g pm2
pm2 start server.js --name "hospital"
pm2 startup
pm2 save
```

5. **Configurar Nginx (reverse proxy):**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **HTTPS com Let's Encrypt:**
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d seu-dominio.com
```

### 🐳 Docker

Criar `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Criar `docker-compose.yml`:

```yaml
version: '3'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: hospital_db
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/init.sql
      - mysql_data:/var/lib/mysql

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: hospital_db
    depends_on:
      - db

volumes:
  mysql_data:
```

Executar:
```bash
docker-compose up -d
```

## Backup e Manutenção

### 🔄 Backup Automático do Banco de Dados

Script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hospital"
DB_NAME="hospital_db"

mkdir -p $BACKUP_DIR

mysqldump -u root -p"$DB_PASSWORD" $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup realizado: $BACKUP_DIR/backup_$DATE.sql"
```

Agendar com cron (diário às 2 AM):
```bash
crontab -e
# Adicionar:
0 2 * * * /caminho/para/backup.sh
```

### 📊 Monitoramento

Ferramentas recomendadas:
- **New Relic** - Monitoramento de performance
- **Sentry** - Rastreamento de erros
- **DataDog** - Logs e métricas
- **Uptime Robot** - Verificação de disponibilidade

### 🔍 Logs

Configurar logging em `server.js`:

```javascript
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = fs.createWriteStream(
  path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

// Log de requisições
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logFile.write(`${timestamp} ${req.method} ${req.path} ${res.statusCode}\n`);
  next();
});
```

## Checklist de Produção

- [ ] SHA-256 mudado para bcryptjs
- [ ] JWT_SECRET mínimo 32 caracteres
- [ ] HTTPS/SSL ativado
- [ ] CORS_ORIGIN configurado corretamente
- [ ] Variáveis de ambiente não estão versionadas (.env no .gitignore)
- [ ] Database com backups automáticos
- [ ] PM2 ou similar para manter processo rodando
- [ ] Logs sendo capturados
- [ ] Monitoramento ativado
- [ ] Firewall configurado (apenas portas 80, 443)
- [ ] Senha padrão alterada
- [ ] Rate limiting implementado
- [ ] CORS headers revisados
- [ ] Sanitização de entrada (SQL injection)
- [ ] Versionamento de API (/api/v1/...)

## Rate Limiting

Adicionar `express-rate-limit`:

```bash
npm install express-rate-limit
```

Em `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});

app.use('/api/', limiter);
```

## Proteção contra SQL Injection

Usar `mysql2` com prepared statements (já implementado nos controllers):

```javascript
// ✅ Correto (protegido)
const [users] = await connection.query(
  'SELECT * FROM users WHERE username = ?',
  [username]
);

// ❌ Errado (vulnerável)
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

## Versionamento de API

Estruturar rotas:

```javascript
// Em server.js
app.use('/api/v1/auth', require('./backend/routes/auth'));
app.use('/api/v1/users', require('./backend/routes/users'));
// etc
```

## CI/CD Pipeline Exemplo (GitHub Actions)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
          HEROKU_APP_NAME: seu-app-hospital
        run: |
          git remote add heroku https://git.heroku.com/$HEROKU_APP_NAME.git
          git push heroku main
```

## Scaling

Para aplicações com muitos usuários:

1. **Database Replication:**
   - Master-Slave MySQL
   - Read replicas para consultas

2. **Caching:**
   - Redis para sessões
   - Memcached para dados frequentes

3. **Load Balancing:**
   - Nginx ou HAProxy
   - Distribuir tráfego entre múltiplos servidores

4. **CDN:**
   - CloudFlare para assets estáticos
   - Reduz latência global

---

**Projeto pronto para produção!** ✨
