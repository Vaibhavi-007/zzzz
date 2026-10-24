const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const getFilePath = (collection) => path.join(dataDir, `${collection}.json`);

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, items) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${collection}:`, err);
  }
};

module.exports = {
  find: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.filter(item => {
      for (const key of Object.keys(query)) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  findOne: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.find(item => {
      for (const key of Object.keys(query)) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  save: (collection, doc) => {
    const items = readCollection(collection);
    const idKey = doc._id || doc.id || doc.sessionId || doc.participantId;
    const existingIndex = items.findIndex(i => (i._id && i._id === idKey) || (i.sessionId && i.sessionId === idKey) || (i.participantId && i.participantId === idKey));
    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...doc, updatedAt: new Date().toISOString() };
    } else {
      items.push({ ...doc, createdAt: doc.createdAt || new Date().toISOString() });
    }
    writeCollection(collection, items);
    return doc;
  },
  delete: (collection, query = {}) => {
    let items = readCollection(collection);
    items = items.filter(item => {
      for (const key of Object.keys(query)) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    writeCollection(collection, items);
  }
};
