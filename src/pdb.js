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

exports.pdb = async (id) =>
{
  var text = null;

  if(cache[id])
  {
    return cache[id].sequence;
  }

  try
  {

/*
application/x-www-form-urlencoded
multipart/form-data
text/plain

*/
    const response = await fetch( `https://www.rcsb.org/fasta/entry/${id}/display`
                                  // , { 
                                  //     method: "GET"
                                  //     , headers: { 'Content-Type': 'multipart/form-data' }

                                  //     // , mode: "no-cors" // no-cors, cors, *same-origin
                                  //     // , cache: "no-cache" // *default, no-cache, reload, force-cache, only-if-cached
                                  //     // , credentials: "same-origin" // include, same-origin, *omit
                                  //     //{
                                  //     //    "Content-Type": "application/json; charset=utf-8",
                                  //         // "Content-Type": "application/x-www-form-urlencoded",
                                  //     //},
                                  //     // , redirect: "follow" // manual, *follow, error
                                  //     // , referrer: "no-referrer" // no-referrer, *client
                              
                                  //     }
                                );
    // let blob = await response.blob(); // download as Blob object

    // text = await blob.text();
    text = await response.text();

  }
  catch (error)
  {
    console.log(error);
  }



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