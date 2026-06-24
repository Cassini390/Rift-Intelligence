// Data Dragon asset URLs + champion display-name resolution.
let DD_VERSION = '14.24.1'
const BASE = 'https://ddragon.leagueoflegends.com/cdn/'

export function setVersion(v) { if (v) DD_VERSION = v }
export const champImg = (n) => BASE + DD_VERSION + '/img/champion/' + n + '.png'
export const itemImg  = (i) => BASE + DD_VERSION + '/img/item/' + i + '.png'
export const spellImg = (i) => BASE + DD_VERSION + '/img/spell/' + i + '.png'
export const runeImg  = (ic) => BASE + 'img/' + ic
export const iconImg  = (i) => BASE + DD_VERSION + '/img/profileicon/' + i + '.png'

// Champion display names (TwistedFate → Twisted Fate). Falls back to inserting
// spaces before capitals/numerals until the real lookup loads.
const CHAMP_NAMES = {}
export function prettyChamp(k) {
  return k ? k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Za-z])([0-9])/g, '$1 $2') : ''
}
export function displayChamp(k) { return CHAMP_NAMES[k] || prettyChamp(k) }
export async function loadChampNames(v) {
  try {
    const r = await fetch(BASE + (v || DD_VERSION) + '/data/en_US/champion.json')
    const j = await r.json()
    Object.keys(j.data).forEach((k) => { CHAMP_NAMES[j.data[k].id] = j.data[k].name })
  } catch { /* keep fallback */ }
}
