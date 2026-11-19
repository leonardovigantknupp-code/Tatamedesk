# TatameDesk

Primeira versão inicial (MVP) da agenda pessoal/operacional, conforme briefing de 19/11/2026.

## O que já funciona
- Painel Hoje com compromissos e tarefas pendentes.
- Criar, editar e excluir compromissos com data, horários, categoria, prioridade e antecedência de lembrete.
- Calendário mensal com seleção de data.
- Criar, concluir e excluir tarefas.
- Criar e excluir turmas personalizadas, com dias, horários, professor e local.
- Interface responsiva para celular e computador.
- PWA básico e funcionamento offline após o primeiro carregamento.
- Dados salvos localmente no navegador deste dispositivo.

## Limitações importantes desta primeira entrega
- Os dados ficam no armazenamento local do navegador; ainda não existe login, banco online ou sincronização entre dispositivos.
- Os lembretes são registrados como preferência no compromisso, mas notificações automáticas ainda não estão implementadas.
- A visualização semanal é uma melhoria futura.
- Não há módulo financeiro nem cadastro de alunos nesta etapa.
- Não há percentuais de divisão financeira.

## Publicar gratuitamente no GitHub Pages
1. Crie um repositório novo no GitHub, por exemplo `tatamedesk`.
2. Marque-o como **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **Add file** > **Upload files**.
4. Extraia este ZIP no computador ou celular. Envie os arquivos e pastas que estão dentro da pasta `tatamedesk` (não envie apenas o ZIP).
5. Clique em **Commit changes**.
6. Abra **Settings** > **Pages**.
7. Em **Build and deployment**, selecione **Deploy from a branch**.
8. Em **Branch**, escolha `main` e pasta `/ (root)`, depois **Save**.
9. Aguarde alguns minutos. O endereço ficará parecido com `https://SEU-USUARIO.github.io/tatamedesk/`.

## Teste local
Abra `index.html` em um navegador. Para instalar como PWA e testar o modo offline, publique por HTTPS (GitHub Pages serve HTTPS).

## Próximas etapas recomendadas
1. Validar a agenda no celular.
2. Implementar backend com autenticação e banco de dados online.
3. Implementar notificações reais e visualização semanal.
4. Evoluir para alunos e financeiro básico, sem percentuais.
