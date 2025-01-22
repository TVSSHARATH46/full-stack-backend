const uuidv4 = require('uuid').v4
const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const cors = require('cors')
const dbPath = path.join(__dirname, "users.db")

const app = express()
app.use(express.json())
app.use(cors())
let db;

const initializeDBAndServer = async () =>{
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(4606, () => {
            console.log("Server Running at http://localhost:4606")
        })
    }
    catch(e){
        console.log(`Error: ${e}`)
        process.exit(1)
    }
}

initializeDBAndServer()

// getting users from userData
app.get('/users', async(req, res) => {
    const sqlQurey = `SELECT * FROM userData`
    const getResults = await db.all(sqlQurey)
    res.send(getResults)
})

//getting specific item
app.get('/users/:id', async (req, res) => {
    const {id} = req.params
    const sqlQurey =`SELECT * FROM userData WHERE id = '${id}'`
    let executeQurey = await db.get(sqlQurey)
    const errorResult = {
        "status_code": 404,
        "error_msg": "User is not found"
      }
    if(executeQurey === undefined){
        res.status(401)
        res.send(errorResult)
    }
    else{
        res.send(executeQurey)
    }
    
})

// creating item and adding in userData table
app.post('/users', async (req, res) => {
    const userDetails = req.body
    const {
        name,
        age
    } = userDetails
    const id = uuidv4()
    const addItemQuery = `INSERT INTO userData (id, name, age)
                          VALUES
                          (
                            '${id}',
                            '${name}',
                            ${age}
                          )`
    const executeQurey = await db.run(addItemQuery)
    const newItemId = executeQurey.lastID;
    res.send({id: newItemId})
})

//updating specific user from userData table
app.put('/users/:id', async (req, res) => {
    const {id} = req.params
    const userDetails = req.body
    const {name, age} = userDetails
    const updateQuery = `
                        UPDATE userData
                        SET
                            name = '${name}',
                            age = ${age}
                        WHERE
                            id = '${id}'`
    await db.run(updateQuery);
    res.send("User Updated Sucessfully");
})

//deleting item from userData table
app.delete('/users/:id', async (req, res) => {
    const {id} = req.params
    const deleteQuery = `DELETE FROM userData WHERE id = '${id}'`
    await db.run(deleteQuery)
    res.send("deleted")
})
