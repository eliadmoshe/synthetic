import {igem, isIgemPart} from './igem.js';
import {pdb, isPdbPart} from './pdb.js';
import {writeVariants} from './io.js';
import { getCodonUsageTable, searchCodonUsageTable } from './codon-usage-optimization.js';
import './io.js';
import './util.js';


globalThis.currentCodonUsageTable = await getCodonUsageTable('155864'); // Escherichia coli O157:H7 EDL933

// searchCodonUsageTable('Escherichia');


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

export function promoter(obj) { return part('promoter', obj); }
export function rbs(obj) { return part('rbs', obj); }
export function cds(obj) { return part('cds', obj); }
export function terminator(obj) { return part('terminator', obj); }
export function proteinDomain(obj) { return part('proteinDomain', obj); }
export function translationalUnit(obj) { return part('translationalUnit', obj); }
export function dna(obj) { return part('dna', obj); }
export function composite(obj) { return part('composite', obj); }
export function proteinGenerator(obj) { return part('proteinGenerator', obj); }
export function restrictionSite(obj) { return part('restrictionSite', obj); }
export function reporter(obj) { return part('reporter', obj); }
export function inverter(obj) { return part('inverter', obj); }
export function receiver(obj) { return part('receiver', obj); }
export function sender(obj) { return part('sender', obj); }
export function measurement(obj) { return part('measurement', obj); }
export function primerBindingSite(obj) { return part('primerBindingSite', obj); }

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

export async function run(str)
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
      if(isSequence(variant[j]))
      {
        variant[j] = optimizeSequence(variant[j]);  
      }
      else if(isIgemPart(variant[j]))
      {
        variant[j] = await igem(variant[j]);
      }
      else if(isPdbPart(variant[j]))
      {
        let aaSequence = await pdb(variant[j]); 
        variant[j] = optimizeSequence(aaSequence);
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
  writeVariants('result.fasta', 'Compiled Sequence', combinedVariants);





  // Return result
  return combinedVariants;
}





// https://developer.mozilla.org/en-US/docs/Glossary/Global_object


globalThis.promoter = promoter;
globalThis.rbs = rbs;
globalThis.cds = cds;
globalThis.terminator = terminator;
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
