/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const fetch = require ('cross-fetch');

var cache = [];


exports.getCodonUsageTable = async (id) =>
{
  var text = null;

  if(cache[id])
  {
    return cache[id];
  }

  try
  {
    const response = await fetch( `http://www.kazusa.or.jp/codon/cgi-bin/showcodon.cgi?species=${id}&aa=1&style=N`
                                  // , 
                                  // { 
                                  //   method: "GET"
                                  //   , headers: { 'Content-Type': 'multipart/form-data' }
                                  // }
                                );
    text = await response.text();
  }
  catch (error)
  {
    console.log(error);
  }


  var table = 
  {
    frequencies: []
    , aAfrequencies: []
    , rawString: ''
  };

  if(text)
  {
    // console.log(text);

    let regexp = /<PRE>([^@]*)<\/PRE>/igm;
    var match = regexp.exec(text);

    if(!match)
    {
      // Handle Error
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
        , aa: result[2]
        , fraction: parseFloat(result[3])
        , frequencyPerThousand: parseFloat(result[4])
        , number: parseInt(result[5])  
      }

      table.frequencies.push(frequency);
    }

    // Make sure there are 64 frequencies
    if(table.frequencies.length != 64)
    {
      return null;
    }
  }
  else
  {
    return null;
  }



  // Create a lookup table array that contains the most frequent codons

  for(let i = 0; i < table.frequencies.length; i++)
  {
    let f = table.frequencies[i];

    if(!table.aAfrequencies[f.aa] || table.aAfrequencies[f.aa].fraction < f.fraction)
    {
      table.aAfrequencies[f.aa] = f;
    }
  }

  // console.log(table.frequencies);
  // console.log(table.aAfrequencies);

  // Store table in cache for faster access
  cache[id] = table; 

  return table;
}

exports.searchCodonUsageTable = async (query) =>
{
  // replace white spcae with '+'
  query = query.replace(/\s+/g, '+');

  console.log(query);

  var text = null;

  // if(cache[id])
  // {
  //   return cache[id];
  // }

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
  
  console.log(text);


    // let table = getCodonUsageTable(organism);

    // if(!table) return;

    // let dnaSequence = '';
}