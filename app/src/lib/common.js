exports.isNull = function(obj) {
    if( typeof(obj)!="undefined" && obj!=null ) {
        return false;
    }

    return true;
}