const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const _ = require('lodash');
mongoose.connect('mongodb://localhost:27017/todolistDB');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));

const now = new Date().toLocaleDateString('en-us', { weekday:"long", month:"long", day:"numeric"});


const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: `Click the '+' button to add new Items`
})
const item2 = new Item({
    name: 'Tick the checkbox to chalk them off your list'
})

const defaultItems = [];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model('List', listSchema)

app.get('/about', function(req, res){
    res.render('about');
})

app.get('/', (req, res) => {
    
    Item.find({})
        .then(function(result){
            // if(result.length === 0 ){
            //     Item.insertMany(defaultItems)
            //         .then(function () {
            //             console.log("Successfully saved DEFAULT items to DB");
            //         })
            //         .catch(function (err) {
            //             console.log(err);
            //         });
            //     res.redirect("/");    
            // }else
            res.render('list', {kindOfDay: now, tasks: result});
        });
})


app.post('/', (req,res) =>{
    
    let item = req.body.task;
    let listName = req.body.button;
    
    const newItem = new Item({
        name: item
    });
   
    if(listName === now)  {
        newItem.save();
        res.redirect('/');
    }
    else{
        List.findOne({name: listName}).then(doc =>{
            doc.items.push(newItem);
            doc.save();
            res.redirect("/" +listName);
        })
    }

   
})

app.post('/delete', (req, res)=>{
    const checkedItemId = req.body.checkbox ;
    const listName = req.body.listName;
    if(listName === now){
        const ItemsDeleted = Item.deleteOne({_id: checkedItemId}).exec();
        res.redirect('/');
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(doc =>{
            console.log(doc);
            res.redirect("/" + listName);
        });
        
    }
    
})


app.get('/:listName', (req,res) =>{
    
    const listName = _.capitalize(req.params.listName);
    List.findOne({name: listName})
        .then(doc => {            
            if(doc === null){
                const newList = new List({
                    name: listName,
                    items: defaultItems
                })
                newList.save();
                console.log("Saved new list to DB");
                res.redirect("/" + listName);
            }else
            res.render('list', {kindOfDay: listName, tasks: doc.items});
        });
    
    

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})