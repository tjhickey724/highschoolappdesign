'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var userSchema = Schema( {
  username: String,
  passphrase: String
} );

module.exports = mongoose.model( 'User', userSchema );
