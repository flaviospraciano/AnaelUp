# Anael Up!

App pessoal do Anael: meditação diária (com voz guiada), agenda, hábitos, mantras, gasto rápido, planilha de gastos, contas, timer de estudos e diário.

## Publicar (GitHub Pages)
1. Crie um repositório novo (ex.: `anael-up`) e envie **todo o conteúdo** desta pasta, mantendo `css`, `js` e `assets`.
2. Em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`.
3. Abra o link no celular do Anael e instale:
   - **Android:** Chrome → menu ⋮ → *Instalar app*.
   - **iPhone:** Safari → Compartilhar → *Adicionar à Tela de Início*.
4. Cada meditação baixa o áudio na primeira vez que é tocada; depois funciona sem internet.

## Dados
Os dados ficam no celular e, com **Ajustes → Entrar com Google**, também no Firebase (projeto `anael-up`). Faça backup em **Módulos → Ajustes → Salvar backup** e guarde o arquivo no Drive ou no WhatsApp. O app lembra a cada 30 dias.

## Meditações
- Timers de 5, 10 e 15 minutos já prontos, ou qualquer tempo de 1 a 60.
- Guiadas com voz: Respiração calma, Atenção ao corpo, Acalmar a mente e Gratidão. Também há a opção Em silêncio (só sino).
- As falas se espalham pelo tempo escolhido. Os áudios ficam em `assets/med/` (voz sintetizada, sem custo e sem internet).
- Jogo: cada minuto vale 1 XP, sessão completa vale +5. O jardim cresce em 11 níveis, a sequência de dias fica no topo e há 13 conquistas.
- No iPhone, deixe o app aberto com a tela ligada durante a meditação (o app pede para a tela não apagar). No Android, pode bloquear a tela.

## Mapa dos arquivos
| Arquivo | O que tem |
|---|---|
| `js/01-base.js` | utilidades, armazenamento, navegação, formulários, sino |
| `js/02-meditacao.js` | meditação, jogo, jardim e motor de áudio |
| `js/03-inicio-agenda.js` | Início (3 turnos), agenda, hábitos, mantras |
| `js/04-financas.js` | gasto rápido, planilha de gastos, contas a pagar e a receber |
| `js/05-estudos-notas.js` | timer de estudos, anotações e diário, módulos, ajustes, inicialização |
| `sw.js` | funcionamento sem internet |
