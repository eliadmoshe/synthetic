/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const fetch = require ('cross-fetch');
const convert = require ('xml-js');

var cache = [];

exports.igem = async (id) =>
{
  var text = null;

  if(cache[id])
  {
    return cache[id];
  }

  try
  {
    const response = await fetch(`http://parts.igem.org/xml/part.${id}`, { method: "GET", headers: { 'Content-Type': 'text/xml' }});
    text = await response.text();
  }
  catch (error)
  {
    console.log(error);
  }


  var sequence = '';

  if(text)
  {
    // console.log(text);

    var result = convert.xml2json(text, {compact: true, spaces: 4});

    result = JSON.parse(result);

    sequence = result.rsbpml.part_list.part.sequences.seq_data._text;

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