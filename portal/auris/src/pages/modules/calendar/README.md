# Instruções de Deploy (Linux Debian)

O projeto "Calendário Corporativo Aliança Tur" foi estruturado para ser implantado facilmente em um ambiente Linux Debian.
Ele contém o Frontend em React/Vite compilado junto a um Backend Node.js de alta disponibilidade suportado por PM2 ou Systemd.

## 1. Instalar Requisitos do Sistema
Conecte-se via SSH no seu servidor Debian como root ou usuário com privilégios de sudo.

\`\`\`bash
# Atualizar repositórios e sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl build-essential sqlite3

# Instalar Node.js (Recomendamos v20.x+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
\`\`\`

## 2. Preparar e Compilar a Aplicação
Envie o diretório do projeto para o servidor (por exemplo, na pasta \`/var/www/alianca-tur\`).

\`\`\`bash
# Acesse o diretório
cd /var/www/alianca-tur

# Instale as dependências Node.js
npm install

# Compile os arquivos (A lógica cria a pasta /dist/ para arquivos estáticos e bundle da API)
npm run build
\`\`\`

## 3. Variáveis de Ambiente
Copie o modelo de ambiente e insira a credencial da API do Resend (RESEND_API_KEY).

\`\`\`bash
cp .env.example .env
nano .env  # (Edite conforme necessário e salve usando Ctrl+O, Enter, Ctrl+X)
\`\`\`

## 4. Configurar Autoinicialização (systemd)
Para garantir que a aplicação opere continuamente (24 horas) e inicie junto com o servidor, cadastre o serviço.

1. Crie o arquivo de serviço:
\`\`\`bash
sudo nano /etc/systemd/system/calendario_corporativo.service
\`\`\`

2. Cole este conteúdo (ajustando o diretório de trabalho conforme o seu):
\`\`\`ini
[Unit]
Description=Serviço do Calendario Corporativo Alianca Tur
After=network.target

[Service]
Environment=NODE_ENV=production
Type=simple
User=root
# Altere para o seu diretório real, ex: /var/www/alianca-tur
WorkingDirectory=/var/www/alianca-tur
# O comando de start compila ou já inicia o build. Recomendado rodar o arquivo compilado:
ExecStart=/usr/bin/node dist/server.cjs
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
\`\`\`

3. Ative e Inicie o serviço:
\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable calendario_corporativo
sudo systemctl start calendario_corporativo
sudo systemctl status calendario_corporativo
\`\`\`

## 5. Liberação no Firewall (UFW)
A aplicação agora escuta na porta 3000 por padrão.

\`\`\`bash
# Permitir tráfego na porta principal (3000)
sudo ufw allow 3000/tcp
sudo ufw reload
\`\`\`
Pode-se também instalar e configurar o NGINX para atuar como Proxy Reverso para a porta 80/443.

## 6. Backup Automático do SQLite
O banco de dados SQLite fica salvo no arquivo \`alianca_tur.sqlite\` na raiz do projeto. 
Para criar um backup automatizado via Crontab (exportação de dump):

\`\`\`bash
# Adicionar regra no crontab
crontab -e
\`\`\`

Adicione a linha para backup diário à meia-noite:
\`\`\`text
0 0 * * * sqlite3 /var/www/alianca-tur/alianca_tur.sqlite ".backup '/var/backups/alianca_tur_$(date +\%F).sqlite'"
\`\`\`

---
*Pronto! Seu sistema está configurado de forma resiliente, com persistência ativada e disparos de e-mail agendados automáticos.*
