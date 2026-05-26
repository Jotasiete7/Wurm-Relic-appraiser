const ITEM_HEADER = /You see (?:an? )?(?:(rare|supreme|fantastic) )?(?:([a-z]+) )?(.+?)\./i;
const QL_DAM = /Ql:\s*([\d.]+),\s*Dam:\s*([\d.]+)/i;

const log = `[16:42:05] You see a rare iron hammer. Ql: 91.33, Dam: 0.0.`;

console.log("Header:", log.match(ITEM_HEADER));
console.log("QL:", log.match(QL_DAM));

const log2 = `You see a longsword. Ql: 74.52, Dam: 0.0.`;
console.log("Header2:", log2.match(ITEM_HEADER));

const rename = `You see "[S] iron hammer". Ql: 91.33, Dam: 0.0.`;
console.log("Rename:", rename.match(ITEM_HEADER));
