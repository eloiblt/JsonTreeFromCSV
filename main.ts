import { Line } from "./models/line";
import { Noeud } from "./models/noeud";
const fs = require('fs')
const csv = require('fast-csv');

const data: Line[] = [];
const tree: Noeud[] = [];
let currentLevel = 0;

fs.createReadStream('./data/SalesforceRelations.csv')
  .pipe(csv.parse({ headers: false }))
  .on('data', row => {
    const array = row[0].split(";");

    const line = {
      id: array[0],
      name: array[1],
      parentId: array[2],
      level: Number(array[3]),
      ancestors: array[4].split("-")
    } as Line;

    data.push(line);
  })
  .on('end', () => {
    traitement();
  });

function traitement() {
  let currentLevelNodes: Noeud[] = [];

  do {
    currentLevelNodes = [...data]
      .filter(l => l.level === currentLevel)
      .map(l => {
        const noeud = {
          id: l.id,
          name: l.name,
          _children: []
        } as Noeud;

        addNoeud(l.parentId, noeud);

        return noeud;
      });

    currentLevel++;
  }
  while (currentLevelNodes.length);

  fs.writeFile('tree.json', JSON.stringify(tree), 'utf8', () => console.log('done'));
}

function addNoeud(parentId: string, noeudToAdd: Noeud) {
  if (!parentId) {
    tree.push(noeudToAdd);
    return;
  }

  for (const n of tree) {
    const parent: Noeud = getNodeFromNode(n, parentId);

    if (parent) {
      parent._children = [...parent._children, noeudToAdd];
      return;
    }
  }
}

function getNodeFromNode(noeud: Noeud, id: string) {
  if (noeud.id === id) { return noeud }

  if (!noeud._children?.length) { return null; }

  let result = null;
  for (const n of noeud._children) {
    result = getNodeFromNode(n, id);
    if (result) { return result }
  }

  return null;
}