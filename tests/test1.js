/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

require( '../index.js');

searchCodonUsageTable('Escherichia').then( 
    (tables) =>
    {
        console.log('Tables: ', tables);
        getCodonUsageTable(tables[0].id).then
        (
            (table) =>
            {
                console.log('Table: ', table);
                setCodonUsageTable(table);
            }
        );
    }
);



function onDrawPlasmid(plasmidId, featurs, variant)
{
    // console.log('plasmidId', plasmidId);
    // console.log('plasmidId', featurs);
    // console.log('variant', variant);
}

compile(

    promoter(['BBa_C0040', '7BKX']) +  rbs(['gcg', 'aaa']) + cds('aaa') + terminator('tgcatggc')



    , onDrawPlasmid
    
    )


