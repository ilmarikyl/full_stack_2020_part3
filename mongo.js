const mongoose = require('mongoose')



const password = process.argv[2]

// const url = `mongodb+srv://ilmari:${password}@cluster0-d0nie.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}

else if (process.argv.length == 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })
    person.save().then(response => {
        console.log(`added ${response.name} number ${response.number} to phonebook`)
        mongoose.connection.close()
    })
}


else  {
    console.log('Give password as argument to list all numbers or password, name and number to add a new entry')
    process.exit(1)
}




