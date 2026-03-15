/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

  const util = require('./util.js');  
 
var cache = [];

exports.pdb = async (id) =>
{
  if(cache[id])
  {
    return cache[id].sequence;
  }


  let text = await util.get( `https://www.rcsb.org/fasta/entry/${id}/display`);


  if(text)
  {
    let newLineStartPos = text.indexOf('\n');
    var header = text.substring(1, newLineStartPos); // Remove '>'
    var sequence = text.substring(newLineStartPos);

    // Make sure there is no white space
    sequence = sequence.replace(/\s/g,''); // remove all white space
    header = header.replace(/[\r\n]/g,''); // remove end of line space

    // Make sure all letters are uppercase
    sequence = sequence.toUpperCase();

    // console.log(text);
    // console.log(header);
    // console.log(sequence);
    // console.log('\r\n');

    // Store parts in cache for faster access
    cache[id] = {header, sequence};   
  }

  return sequence;
}

// See BioBrick and Plasmid naming rules
// https://parts.igem.org/Help:BioBrick_Part_Names
// https://parts.igem.org/Help:Plasmid_backbones/Nomenclature
// Can use both capital and non-capital letters

exports.isPdbPart = (str) =>
{
  let pdbIdkRegexp = /^[0-9A-Z]{4}$/igm;

  let found = str.match(pdbIdkRegexp);

  return found;
}