export function isSequence(str)
{
  let dnaAaRegexp = /^[AC-IK-NP-WYacgt]+$/gm;

  let found = str.match(dnaAaRegexp);

  return found;
}

export function optimizeSequence(str)
{
    let sequence = '';

    for(let i = 0; i < str.length; i++)
    {
      let c = str[i];

      if(c == c.toUpperCase())
      {
        try
        {
            sequence += currentCodonUsageTable.aAfrequencies[c].triplet;
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

globalThis.isSequence = isSequence;
globalThis.optimizeSequence = optimizeSequence;


