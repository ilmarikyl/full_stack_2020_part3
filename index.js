require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('build'))


morgan.token('body', (req) => {
	return JSON.stringify(req.body)
})

const methodIsPost = (req) => {
	return req.method === 'POST'
}

app.use(morgan('tiny', {
	skip: function (req) { return methodIsPost(req) }
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
	skip: function (req) { return !methodIsPost(req) }
}))


app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons => {
		res.json(persons)
	})
})


app.get('/info', (req, res, next) => {
	Person.count({})
		.then( count => {
			const info =
				`
				<p>Phonebook has info for ${count} people</p>
				<p>${new Date()}</p>
				`

			res.send(info)
		})
		.catch(error => next(error))

})


app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))

})


const generateId = () => {
	const new_id = Math.floor(Math.random() * Math.floor(100000))

	return new_id
}


app.post('/api/persons', (request, response, next) => {
	const body = request.body

	if (!body.name || !body.number) {
		return response.status(400).json({ error: 'name or number missing' })
	}

	const person = new Person({
		name: body.name,
		number: body.number,
		id: generateId()
	})

	person.save().then(savedPerson => {
		response.json(savedPerson)
	})
		.catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	if (!body.number) {
		return response.status(400).json({ error: 'name or number missing' })
	}

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end()
		})
		.catch(error =>
			next(error))
})


const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}

	if (error.name === 'ValidationError') {
		return response.status(400).send({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)













