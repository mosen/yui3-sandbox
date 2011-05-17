Y.mix(Y.Column, {
   ATTRS : {
       /**
        * Alignment of cell contents, applied to the liner div element.
        *
        * @attribute align
        * @default undefined
        */
       align : {
           value : undefined
       },
       
       /**
        * Function used for sorting column values, applied to recordset.
        * 
        * This is mentioned but not implemented in DataTable.Base
        * 
        * @attribute sortFn
        * @default null
        */
       sortFn : {
           value : null
       }
   } 
}, false, null, 0, true); // Mix with merge