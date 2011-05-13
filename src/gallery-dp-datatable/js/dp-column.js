Y.mix(Y.Column, {
   ATTRS : {
       align : {
           value : 'left'
       },
       
       /**
        * Function used for sorting column values, applied to recordset.
        */
       sortFn : {
           value : null
       }
   } 
}, false, null, 0, true); // Mix with merge