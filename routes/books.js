var router = require('express').Router();
var pg = require('pg');

var config = {
  database: 'rho' //name of databse we want to connect to
};

//initialize the database connection pool
//the pool object is what we go through everytime we need to connect to the database
var pool = new pg.Pool(config);


//example of how to look up particular book based on id
router.get('/:id', function(req, res) {
  pool.connect(function (err, client, done) {
    if (err) {
      console.log('Error connecting to the DB', err);
      res.sendStatus(500);
      done();
      return;
    }
    client.query('SELECT * FROM books WHERE id = $1;', [req.params.id], function(err, result){
      done();
      if (err) {
        console.log('Error querying the DB', err);
        res.sendStatus(500);
        return;
      }
      //result object is special JS object that has array of
      console.log('Got rows from the DB:', result.rows);
      res.send(result.rows);
    });

  });
});


router.get('/', function (req, res) {
  //err - an error object, will be not-nul if there was an error connecting
  //      possible errors, db not running, config is wrong
  //client - object that is used to make queries agianst the database
  //done - function to call when you're done (returns connection back to the pool)
  pool.connect(function (err, client, done) {
    //to deal with any potential errors
    if (err) {
      console.log('Error connecting to the DB', err);
      res.sendStatus(500);
      done(); //so connection can be destroyed
      return;
    }
    //1. SQL string
    //2. (optional) input parameters
    //3. callback function to execute once the query is finished
    //   takes an error object and a result object as args
    client.query('SELECT * FROM books', function(err, result){
      done();
      if (err) {
        console.log('Error querying the DB', err);
        res.sendStatus(500); //typically 400 error code if it may be error on client side
        return;
      }
      //result object is special JS object that has array of
      console.log('Got rows from the DB:', result.rows);
      res.send(result.rows);
    });

  })
});

router.post('/', function(req, res){
  pool.connect(function(err, client, done){
    if (err) {
      res.sendStatus(500);
      done();
      return;
    }

    client.query('INSERT INTO books (author, title, published, edition, publisher) VALUES ($1, $2, $3, $4, $5) returning *;',
                [req.body.author, req.body.title, req.body.published, req.body.edition, req.body.publisher],
                function (err, result) {
      done();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.send(result.rows);
    });
  });
});

module.exports = router;
