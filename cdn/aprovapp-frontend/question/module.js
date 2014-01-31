var questionModule = angular.module('questionModule', ['modalModule','ngSanitize']);

var fisherYates = function( myArray ) {
    var i = myArray.length, j, temp;
    if ( i === 0 ) return false;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = myArray[i];
        myArray[i] = myArray[j]; 
        myArray[j] = temp;
    }
}