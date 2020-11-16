'use strict';
let myRsa = require('my_rsa');

/*
*   Singleton class of RSA so that the key is the same on all places
*   (new Rsa()).get()   <-  my_rsa class with the keys
*/
class Rsa {

    constructor() {
        if(!Rsa.instance)
            Rsa.instance = new myRsa();
    }

    get(){
        return Rsa.instance;
    }
}
module.exports = Rsa;
