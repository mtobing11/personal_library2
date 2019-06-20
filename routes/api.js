/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').find().toArray((err,docs)=>{
          //console.log(docs);
          docs = docs.map(item=>({
            title: item.title,
            _id: item._id,
            commentcount:item.comments.length
          }));
          //console.log(docs);
          res.json(docs);
          db.close()
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      //console.log(title);
      if(title == '') return res.type('text').send('missing title');
      let book = {title:title, comments:[]};
      //console.log(book);
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').insertOne(book,(err,docs)=>{
          if(err) res.json(err);
          //console.log(docs);
          res.json(docs.ops[0]);
          db.close();
        })
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').remove({},(err,docs)=>{
          if(err) throw err;
          console.log(docs.result.ok);
          db.close();
          
        })
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      //console.log(bookid);
      //console.log(ObjectId(bookid));
    
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.type('text').send('no book exists');
      }  
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').findOne({_id: ObjectId(bookid)},(err,docs)=>{
          if(err) throw err;
          docs !== null ? res.json(docs) : res.type('text').send('no book exists');
          db.close();
        })
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      //console.log(comment);
    
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.json('no book exists');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db)=>{
        db.collection('books').findOneAndUpdate({_id:ObjectId(bookid)},{$push:{comments:comment}},{returnOriginal:false},(err,docs)=>{
          if(err) throw err;
          //console.log(docs.value);
          docs.lastErrorObject.updatedExisting === true ? res.json(docs.value) : res.type('text').send('no book exists');
          db.close();
        });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
      console.log(bookid);
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').remove({_id:ObjectId(bookid)},(err,docs)=>{
          if(err) throw err;
          docs.result.ok ? res.json('delete successful') : res.type('text').send('no ID exists')
          db.close();
        });
      });
    });
  
};
