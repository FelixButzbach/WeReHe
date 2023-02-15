# Weekly Recap Helper -> WeReHe

This project was meant to practice prototyping and to play around with remix, typescript, tailwind, Prisma and maybe even testing and fly.io
In the end, it was created with Vite :D

## Idea:
1. Copy the content of the last Trello weekly recap card description (markup) and insert it into the werehe tool.
2. It will parse the content and show it in an easy to navigate way where all of the following options can be done on every task:
  - Add a new update
  - Mark as Done
3. It should also be possible to insert new tasks.
4. Once all items have been added or edited, the tool can export the new list as markup which then can be inserted into the next weekly recap card.
5. When exporting, the following steps should be taken
  - Move the cards to the correct sections (edited cards will move to TAREFAS EM ANDAMENTO, New cards will be added to NOVAS TAREFAS)
  - Add the current date to all cards that have been edited or added
6. Export with markup styling


## Log:
- 06.02.23, 20:15: Started
- 06.02.23, 22:30: Installed and followed the remix-indie-stack example project. Learned a bit about the basics of Remix, typescript and Prisma
- 13.02.23, 21:05 - 22:45: Create a Vite app to get started quickly, created the first draft of the data input and main screens, lost a lot of time with form input value retrieval, first test with markdown parser
- 14.02.23, 12:50 - 13:50: Implemented the basic parsing logic
- 14.02.23, 22:15 - 23:15: Better rendering, including the children
- 14.02.23, 23:30 - 00:15: Implemented the export function
- 15.02.23, 12:15 - 13:00: Implemented the add new child function
- 15.02.23, 21:00 - 23:15: Added removal of newly added child and enter listener, added addItem functionality, added removeItem functionality
- 15.02.23, 23:30 - 00:15: Created a github repo and forked it on Stackblitz
- Next: Add 'Mark Done' function

