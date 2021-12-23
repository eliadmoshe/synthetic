/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

 const igem = require('./igem.js');
 const pdb = require('./igem.js');
 const io = require('./io.js');
 const util = require('./util.js');
 const codonUsageOptimization = require('./codon-usage-optimization.js');



// import {igem, isIgemPart} from './igem.js';
// import {pdb, isPdbPart} from './pdb.js';
// import {writeVariants} from './io.js';
// import { getCodonUsageTable, searchCodonUsageTable } from './codon-usage-optimization.js';
// import './io.js';
// import './util.js';


// globalThis.currentCodonUsageTable = await codonUsageOptimization.getCodonUsageTable('155864'); // Escherichia coli O157:H7 EDL933

// codonUsageOptimization.searchCodonUsageTable('Escherichia');


function part(type, ptr)
{
  let obj;

  if(Array.isArray(ptr))
  {
    obj = {type: type, group: ptr}
  }
  else if(typeof ptr == 'string')
  {
    obj = {type: type, group: [ptr]}
  }

  return JSON.stringify(obj) + ', ';
}

let promoter = (obj) => { return part('promoter', obj); }
let rbs = (obj) => { return part('rbs', obj); }
let cds = (obj) => { return part('cds', obj); }
let terminator = (obj) => { return part('terminator', obj); }
let proteinDomain = (obj) => { return part('proteinDomain', obj); }
let translationalUnit = (obj) => { return part('translationalUnit', obj); }
let dna = (obj) => { return part('dna', obj); }
let composite = (obj) => { return part('composite', obj); }
let proteinGenerator = (obj) => { return part('proteinGenerator', obj); }
let restrictionSite = (obj) => { return part('restrictionSite', obj); }
let reporter = (obj) => { return part('reporter', obj); }
let inverter = (obj) => { return part('inverter', obj); }
let receiver = (obj) => { return part('receiver', obj); }
let sender = (obj) => { return part('sender', obj); }
let measurement = (obj) => { return part('measurement', obj); }
let primerBindingSite = (obj) => { return part('primerBindingSite', obj); }

function combineAll(arrayOfArrays)
{
   const result = [];

   let max = arrayOfArrays.length -1;

   let f = (arr, i) =>
           {
              let l = arrayOfArrays[i].length;

              for(let j = 0; j < l; j++)
              {
                 let copy = arr.slice(0);
                 copy.push(arrayOfArrays[i][j]);

                 if (i==max)
                 {
                   result.push(copy);
                 }
                 else
                 {
                   f(copy, i+1);
                 }
              };
        };

   f([], 0);

   return result;
}

function getVariants(root)
{
  let groups = [];

  for(let i = 0; i < root.group.length; i++)
  {
    groups.push(root.group[i].group);
  }

  return combineAll(groups);
}

let run = async (str) =>
{
  str = ' ' + str;  

  // Allow to add combinatorial strings without 'part()'
  str = str.replace( /([a-zA-Z0-9_]+[,])+[a-zA-Z0-9_]+/igm
                     , (match, offset, string) => 
                       {
                        let s = match.replace(/[a-zA-Z0-9_]+/igm, `"$&"`);
                        return `{"type": "dna", "group": [${s}]}, `;
                       }
                    );


  // Allow to add single strings without 'part()'
  str = str.replace(/\s([a-zA-Z0-9_]+)/igm, ` {"type": "dna", "group": ["$1"]}, `)

  // Parse string's json
  let root = JSON.parse(`{ "group": [${str.slice(0,-2)}] }`);
  let variants = getVariants(root);



  // Convert BioBricks to raw sequence
  // Comment this block to see pre proccessed variants structure
  for(let i = 0; i < variants.length; i++)
  {
    let variant = variants[i];

    for(let j = 0; j < variant.length; j++)
    { 
      if(util.isSequence(variant[j]))
      {
        variant[j] = util.optimizeSequence(variant[j]);  
      }
      else if(igem.isIgemPart(variant[j]))
      {
        variant[j] = await igem.igem(variant[j]);
      }
      else if(pdb.isPdbPart(variant[j]))
      {
        let aaSequence = await pdb.pdb(variant[j]); 
        variant[j] = util.optimizeSequence(aaSequence);
      }
    }
  }
  //*/





  // Generate combined, single string variants
  let combinedVariants = [];

  for(let i = 0; i < variants.length; i++)
  {
    let variant = variants[i];
    let str = '';

    for(let j = 0; j < variant.length; j++)
    { 
      str += variant[j];
    }

    combinedVariants.push(str);
  }




  // Store compiled variants in file
  // io.writeVariants('result.fasta', 'Compiled Sequence', combinedVariants);




  console.log(combinedVariants);

  // Return result
  return combinedVariants;
}





// https://developer.mozilla.org/en-US/docs/Glossary/Global_object

globalThis.promoter = promoter;
globalThis .rbs = rbs;
globalThis .cds = cds;
globalThis .terminator = terminator;
globalThis.proteinDomain = proteinDomain;
globalThis.translationalUnit = translationalUnit;
globalThis.dna = dna;
globalThis.composite = composite;
globalThis.proteinGenerator = proteinGenerator;
globalThis.restrictionSite = restrictionSite;
globalThis.reporter = reporter;
globalThis.inverter = inverter;
globalThis.receiver = receiver;
globalThis.sender = sender;
globalThis.measurement = measurement;
globalThis.primerBindingSite = primerBindingSite;
globalThis.run = run;

exports.promoter = promoter;
exports .rbs = rbs;
exports .cds = cds;
exports .terminator = terminator;
exports.proteinDomain = proteinDomain;
exports.translationalUnit = translationalUnit;
exports.dna = dna;
exports.composite = composite;
exports.proteinGenerator = proteinGenerator;
exports.restrictionSite = restrictionSite;
exports.reporter = reporter;
exports.inverter = inverter;
exports.receiver = receiver;
exports.sender = sender;
exports.measurement = measurement;
exports.primerBindingSite = primerBindingSite;
exports.run = run;
