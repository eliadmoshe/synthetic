/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const util = require('./util.js');

/** Maps Kazusa GenBank division codes to human-readable labels. */
const GB_DIVISIONS = {
  gbbct: 'Bacteria',
  gbphg: 'Phage',
  gbvrl: 'Viral',
  gbpln: 'Plant',
  gbpri: 'Primate',
  gbmam: 'Mammal',
  gbrod: 'Rodent',
  gbvrt: 'Vertebrate',
  gbinv: 'Invertebrate',
  gbuna: 'Unannotated',
};

/**
 * Searches the Kazusa Codon Usage Database for organisms matching a query.
 *
 * @param {string} query - Organism name or partial name (e.g. "Escherichia").
 * @returns {Promise<Array<{
 *   id: string,
 *   name: string,
 *   type: string,
 *   division: string,
 *   geneCount: number
 * }>|null>} Array of matching organisms, or null if the request failed.
 *   - `id`        — Kazusa organism ID (pass to getCodonUsageTable)
 *   - `name`      — Full organism name
 *   - `type`      — GenBank division code (e.g. "gbbct")
 *   - `division`  — Human-readable division label (e.g. "Bacteria")
 *   - `geneCount` — Number of genes in the database for this organism
 */
let searchCodonUsageTable = async (query) =>
{
  // replace white spcae with '+'
  query = query.replace(/\s+/g, '+');

  console.log(query);

  var text = null;

  try
  {
    const response = await fetch(`http://www.kazusa.or.jp/codon/cgi-bin/spsearch.cgi?species=${query}&c=i`, { method: "GET", headers: { 'Content-Type': 'text/xml' }});
    text = await response.text();
  }
  catch (error)
  {
    console.log(error);
  }

  if(!text) return null;

  const result = [];
  const regex = /href="\/codon\/cgi-bin\/showcodon\.cgi\?species=([^"]+)">\s*<I>([^<]+)<\/I>\s*\[(\w+)\]:\s*(\d+)/gi;
  let match;

  while ((match = regex.exec(text)) !== null)
  {
    result.push({
      id: match[1].trim(),
      name: match[2].trim(),
      type: match[3].trim(),
      division: GB_DIVISIONS[match[3].trim()] || match[3].trim(),
      geneCount: parseInt(match[4], 10),
    });
  }

  result.sort((a, b) => b.geneCount - a.geneCount);

  return result;
}




/** In-memory cache of fetched codon usage tables, keyed by organism ID. */
var cache = [];


/**
 * Fetches and parses the codon usage table for a given organism from the
 * Kazusa Codon Usage Database. Results are cached so repeated calls for the
 * same ID are instant.
 *
 * @param {string} id - Kazusa organism ID (e.g. "37762" for E. coli).
 * @returns {Promise<{
 *   dnaTripletFrequencies: Array<{triplet: string, aa: string, fraction: number, frequencyPerThousand: number, number: number}>,
 *   aminoAcidFrequencies: Array,
 *   rawString: string
 * }|null>} Parsed codon usage table, or null if not found / parsing failed.
 *   - `dnaTripletFrequencies`   — All 64 codon entries
 *   - `aminoAcidFrequencies` — Most-frequent codon per amino acid, keyed by single-letter AA code
 *   - `rawString`     — Raw text from the Kazusa database
 */
let getCodonUsageTable = async (id) =>
{
  if(cache[id])
  {
    return cache[id];
  }

  let text = await util.get( `http://www.kazusa.or.jp/codon/cgi-bin/showcodon.cgi?species=${id}&aa=1&style=N`);

  var table = 
  {
    dnaTripletFrequencies: []
    , aminoAcidFrequencies: []
    , rawString: ''
  };

  if(text)
  {
    let regexp = /<PRE>([^@]*)<\/PRE>/igm;
    var match = regexp.exec(text);

    if(!match)
    {
      return null;
    }

    table.rawString = match[1];
    // console.log(table.rawString);

    // Parse table raw text
    let myRegexp = /\s*([a-zA-Z]{3})\s*([a-zA-Z*])\s*([0-9]+\.[0-9]+)\s*([0-9]+\.[0-9]+)\s*\(\s*([0-9]+)\s*\)\s*/igm

    let result;
    while (result = myRegexp.exec(table.rawString)) 
    {
      let frequency = {
        triplet: result[1].toLowerCase().replace(/u/g, 't')
        , aminoAcid: result[2]
        , fraction: parseFloat(result[3])
        , frequencyPerThousand: parseFloat(result[4])
        , number: parseInt(result[5])  
      }

      table.dnaTripletFrequencies.push(frequency);
    }

    // Make sure there are 64 frequencies
    if(table.dnaTripletFrequencies.length != 64)
    {
      return null;
    }
  }
  else
  {
    return null;
  }



  // Create a lookup table array that contains the most frequent codons
  for(let i = 0; i < table.dnaTripletFrequencies.length; i++)
  {
    let f = table.dnaTripletFrequencies[i];

    if(!table.aminoAcidFrequencies[f.aminoAcid] || table.aminoAcidFrequencies[f.aminoAcid].fraction < f.fraction)
    {
      table.aminoAcidFrequencies[f.aminoAcid] = f;
    }
  }



  // Store table in cache for faster access
  cache[id] = table; 

  return table;
}






/**
 * Fetches the codon usage table for the given organism ID and sets it as the
 * globally active table (`globalThis.currentCodonUsageTable`).
 *
 * @param {string} id - Kazusa organism ID.
 * @returns {Promise<void>}
 */

let setCodonUsageTable = async (id) =>
{
  globalThis.currentCodonUsageTable = await getCodonUsageTable(id);
}


let optimizeSequence = (str) =>
{
    let sequence = '';

    for(let i = 0; i < str.length; i++)
    {
      let c = str[i];

      if(c == c.toUpperCase())
      {
        try
        {
            sequence += currentCodonUsageTable.aminoAcidFrequencies[c].triplet;
        }
        catch(err)
        {
          console.log('error');
          console.log(c);
        }
      }
      else
      {
        sequence += c;
      }
    }

    return sequence;
}


/**
 * Public API
 */

exports.searchCodonUsageTable = globalThis.searchCodonUsageTable = searchCodonUsageTable;
exports.getCodonUsageTable    = globalThis.getCodonUsageTable    = getCodonUsageTable;
exports.setCodonUsageTable    = globalThis.setCodonUsageTable    = setCodonUsageTable;
exports.optimizeSequence      = globalThis.optimizeSequence      = optimizeSequence;
