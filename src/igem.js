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

exports.igem = async (id) =>
{
  if(cache[id])
  {
    return cache[id];
  }

  let text = await util.get( `https://parts.igem.org/cgi/xml/part.cgi?part=${id}`);

  var sequence = '';

  if(text)
  {
    // console.log(text);

    var result = util.xml2js(text);

    // result = JSON.parse(result);

    sequence = result.rsbpml.part_list.part.sequences.seq_data;

    sequence = sequence.replace(/\s/g,''); // remove all white space
  
    // Store parts in cache for faster access
    cache[id] = sequence; 
  }

  return sequence;
}

// See BioBrick and Plasmid naming rules
// https://parts.igem.org/Help:BioBrick_Part_Names
// https://parts.igem.org/Help:Plasmid_backbones/Nomenclature
exports.isIgemPart = (str) =>
{
  let bioBrickRegexp = /^BBa_[0-9a-zA-Z_]+$/igm;
  let plasmidRegexp = /^pSB[0-9a-zA-Z_]+$/igm;

  let found = str.match(bioBrickRegexp) || str.match(plasmidRegexp);

  return found;
}