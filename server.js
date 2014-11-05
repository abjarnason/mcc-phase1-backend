// required packages
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');

var app = express();

// so we'll be able to get data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// allowes the use of HTTP verbs such as PUT and DELETE where the client
// doesn't support it.
app.use(methodOverride());

// set up the port
var port = process.env.PORT || 8080;

// connect (and create if needed) the database
mongoose.connect('mongodb://localhost:contactsdb');

// database schema with basic entries 
var ContactSchema = mongoose.Schema({
	name: String,
	email: String,
	phone: String
});

var Contact = mongoose.model('Contact', ContactSchema);
// create a router
var router = express.Router();

// middleware that is used for all requests.
// prints to terminal everytime something happens..
router.use(function(req, res, next) {
	console.log('something just happened..');
	next();
});

// route /contacts entries
router.route('/contacts')

	// create a contact (POST)
	.post(function(req, res) {
		
		var contact = new Contact();		
		contact.name = req.body.name;
		contact.email = req.body.email;
		contact.phone = req.body.phone;

		contact.save(function(err) {
			if (err)
				res.send(err);

			res.json({message: 'contact created'});
		});		
	})

	// get all contacts (GET)
	.get(function(req, res) {
		Contact.find(function(err, contacts) {
			if (err)
				res.send(err);

			res.json(contacts);
		});	
	});

// route /contacts/contacts_id entries
router.route('/contacts/:contact_id')

	// get a specific contact (GET)
	.get(function(req, res) {
		Contact.findById(req.params.contact_id, function(err, contact) {
			if (err)
				res.send(err);
			
			res.json(contact);
		});
	})

	// update a specific contact (PUT)
	.put(function(req, res) {
		Contact.findById(req.params.contact_id, function(err, contact) {

			if (err)
				res.send(err);

			contact.name = req.body.name;
			contact.email = req.body.email;
			contact.phone = req.body.phone;

			contact.save(function(err) {
				if (err)
					res.send(err);

				res.json({message: 'contact updated'});
			});
		});
	})

	// delete a specific contact (DELETE)
	.delete(function(req, res) {
		Contact.remove({
			_id: req.params.contact_id
		}, function(err, contact) {
			if (err)
				res.send(err);

			res.json({message: 'contact deleted'});
		});
	});

// search in the contacts database (GET based on a search term)
router.route('/contacts/search/:search_term')

	// search (using GET)
	.get(function(req, res) {
		// find all entries that match the search term
		Contact.find(
			{$or:[
			{"name": new RegExp(req.params.search_term)},
			{"email": new RegExp(req.params.search_term)},
			{"phone": new RegExp(req.params.search_term)}
			]}, function(err, contact) {
			if (err)
				res.send(err);
			res.json(contact);
		});
	});

// route used specificly to get random contacts..
router.route('/randomcontact')

	.get(function(req, res) {
		Contact.count(function(error,count){
				Contact.aggregate(
					{$skip: Math.floor(Math.random() * count)},
					{$limit: 1}
				,function(err, contact) {
				if (err)
					res.send(err);

				res.json(contact);
			});
		});
	});



// register routes at /api
app.use('/api', router);
// start server
app.listen(port);
console.log('listening on port ' + port);