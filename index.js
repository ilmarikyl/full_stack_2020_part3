const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('build'))


morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})

const methodIsPost = (req) => {
    return req.method === 'POST'
}

app.use(morgan('tiny', {
    skip: function (req, res) { return methodIsPost(req) }
}))
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: function (req, res) { return !methodIsPost(req) }
}))

let persons = [
    {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
    },
    {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
    },
    {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
    },
    {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
    }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello maailma!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/info', (req, res) => {
    res.send(
        `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(persons => persons.id === id)
    
    if (person) {
      response.json(person) 
    } else {
      response.status(404).end()
    }
})


const generateId = () => {
    const new_id = Math.floor(Math.random() * Math.floor(100000))

    return new_id
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const names = persons.map(person => person.name.toLowerCase())

    if (names.includes(body.name.toLowerCase())) {
        return response.status(400).json({ 
            error: 'name must be unique' 
            })
    }
    if (!body.name || !body.number) {
        return response.status(400).json({ 
        error: 'name or number missing' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)
})


app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
    
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
	app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})













