/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

 const igem = require('./igem.js');
 const pdb = require('./pdb.js');
 const util = require('./util.js');
 const codonUsageOptimization = require('./codon-usage-optimization.js');
//  const io = require('./io.js');


globalThis.currentCodonUsageTable = null; 
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

globalThis.promoter = (obj) => { return part('promoter', obj); };
globalThis.rbs = (obj) => { return part('rbs', obj); }
globalThis.cds = (obj) => { return part('cds', obj); }
globalThis.terminator = (obj) => { return part('terminator', obj); }
globalThis.proteinDomain = (obj) => { return part('proteinDomain', obj); }
globalThis.translationalUnit = (obj) => { return part('translationalUnit', obj); }
globalThis.dna = (obj) => { return part('dna', obj); }
globalThis.composite = (obj) => { return part('composite', obj); }
globalThis.proteinGenerator = (obj) => { return part('proteinGenerator', obj); }
globalThis.restrictionSite = (obj) => { return part('restrictionSite', obj); }
globalThis.reporter = (obj) => { return part('reporter', obj); }
globalThis.inverter = (obj) => { return part('inverter', obj); }
globalThis.receiver = (obj) => { return part('receiver', obj); }
globalThis.sender = (obj) => { return part('sender', obj); }
globalThis.measurement = (obj) => { return part('measurement', obj); }
globalThis.primerBindingSite = (obj) => { return part('primerBindingSite', obj); }






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






globalThis.compile = async (str) =>
{
  ////////////////////////////////

  if(!globalThis.currentCodonUsageTable)
  {
    globalThis.currentCodonUsageTable = await codonUsageOptimization.getCodonUsageTable('155864'); // Escherichia coli O157:H7 EDL933
  }


  ///////////////////////////////
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




  // console.log(combinedVariants);

  // Return result
  return combinedVariants;
}