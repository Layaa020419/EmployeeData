var router = require('./routes/employeeRoutes');
var Employee = require('./models/Employee.js');
var server = require('./server');
var io = require('socket.io')(server);

io.on('connection', function (socket) {
	console.log('a user connected');
});

/* Dialog flow post call*/
router.post('/ping', function (req, res, next) {
	console.log('from post:', req.body);
	io.emit('message', {
		intent: req.body.queryResult.intent.displayName,
		parameters: req.body.queryResult.parameters,
		query: req.body.queryResult.queryText
	});
	//console.log(_this.test);
	//console.log(_this.test1);
	res.send({ "fulfillmentText": "Sure", "fulfillmentMessages": [{ "text": { "text": ["Sure"] } }], "source": "webhook sample" });
});


router.post('/voicecommand', function (req, res, next) {
	console.log('from post:', req.body);
	var parameters = req.body.queryResult.parameters;
	var filterString = {};
	if (!Array.isArray(parameters.filterProperty)) {
		parameters.filterProperty = [parameters.filterProperty];//make it an array
	}
	//intent - consider one - Complete Filter
	//assuming filterProperty as array always
	parameters.filterProperty.forEach(property => {
		switch (property) {
			case "Name":
				filterString = stringPropertyManipulation(property, parameters, filterString);
				console.log(filterString);
				break;
			case "Designation":
				filterString = stringPropertyManipulation(property, parameters, filterString, true);
				console.log(filterString);
				break;
				case "Salary":
				filterString = salaryManipulation(property, parameters, filterString, 'amount');
				console.log(filterString);
				break;
				case "Experience":
				filterString = salaryManipulation(property, parameters, filterString, 'amount');
				console.log(filterString);
				break;
			case "All":
				filterString = {};
				break;



		}
	});
	io.emit('message', {
		intent: req.body.queryResult.intent.displayName,
		filterString: filterString,
		query: req.body.queryResult.queryText,
		parameters: req.body.queryResult.parameters
	});
	//console.log(_this.test);
	//console.log(_this.test1);
	res.send({ "fulfillmentText": "Sure", "fulfillmentMessages": [{ "text": { "text": ["Sure"] } }], "source": "webhook sample" });
});

function experienceManipulation(property, parameters, filterString){

}

function salaryManipulation(property, parameters, filterString, propertyTag) {
	var tempStringFilter = {};
	switch (parameters.numCompare) {
		case 'lesser':
			tempStringFilter = []
			if (Array.isArray(parameters[property])) {
				parameters[property].forEach(prop => {
					//assuming single array - more than one value on lesser/greater alone is not right
					tempStringFilter = { [property]: { $lt: prop[propertyTag] } };
				});
			}
			else {
				tempStringFilter = { [property]: { $lt: parameters[property][propertyTag] } };
			}
			break;
		case 'greater':
			if (Array.isArray(parameters[property])) {
				parameters[property].forEach(prop => {
					//assuming single array - more than one value on lesser/greater alone is not right
					tempStringFilter = { [property]: { $gt: prop[propertyTag] } };
				});
			}
			else {
				tempStringFilter = { [property]: { $gt: parameters[property][propertyTag] } };
			}
			break;
		case 'between':
			//has to be array of two values
			if (parameters[property][0] > parameters[property][1]) {
				tempStringFilter = {
					[property]: {
						$lt: parameters[property][0][propertyTag],
						$gt: parameters[property][1][propertyTag]
					}
				};
			}
			else {
				tempStringFilter = {
					[property]: {
						$lt: parameters[property][1][propertyTag],
						$gt: parameters[property][0][propertyTag]
					}
				};
			}
			break;
	}
	return Object.assign({}, filterString, tempStringFilter);
}

function stringPropertyManipulation(property, parameters, filterString, matchWholeWord) {

	var tempStringFilter = {};
	if (Array.isArray(parameters[property])) {
		tempStringFilter = { '$or': [] };

		parameters[property].forEach(name => {
			if (matchWholeWord) {
				//{Name: {$regex: '^margaret harper$', $options: 'i'}}
				tempStringFilter['$or'].push({ [property]: { $regex: '^' + name + '$', $options: 'i' } });
			}
			else {
				tempStringFilter['$or'].push({ [property]: { $regex: '.*' + name + '.*', $options: 'i' } });
			}

		});
	}
	else {
		if (matchWholeWord) {
			tempStringFilter = { [property]: { $regex: '^' + parameters[property] + '$', $options: 'i' } };
		}
		else {
			tempStringFilter = { [property]: { $regex: '.*' + parameters[property] + '.*', $options: 'i' } };
		}

	}
	return Object.assign({}, filterString, tempStringFilter);

}
module.exports = io;