const express=require("express");
const bodyParser=require("body-parser");


const app=express();
const mongoose=require("mongoose");
const _=require("lodash");

app.set('view engine',"ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connecting to database todoDB()dbname
mongoose.connect("mongodb+srv://admin-Raghu:Raghu@619@cluster0.ihlbm.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

//schema
const itemSchema=new mongoose.Schema({
  name:String
});

//model with singular collection name
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your todo list."
});

const item2=new Item({
  name:"Hi the + button is to add a new item."
});


const item3=new Item({
  name:"<---hit this to delete a item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/",function(req,res){
  Item.find({},(err,foundItems)=>{
    if (foundItems.length === 0){
      Item.insertMany(defaultItems,(err)=>{
        if(err) console.log("Failed to insert");
        else console.log("Succesfully inserted into db");
      });
      res.redirect("/");
      //res.render("list", { listTitle: "Today", newlistItem: defaultItems });
    }else{
      res.render("list", { listTitle: "Today", newlistItem: foundItems });
    }
  });
  
}); 



app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //show existing list
        res.render("list",{listTitle: foundList.name, newlistItem: foundList.items});
      }
    }
  });
  
});




app.post("/create",(req,res)=>{
  
  const customListName = _.capitalize(req.body.createList);
  // if(customListName === "Today"){
  //   console.log("you are in today");
  //   res.redirect("/");
  // }
  List.findOne({name:customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        //console.log("New: "+customListName);
        res.redirect("/"+customListName);
      }
      else{
        //show existing list
        //console.log("Existing: "+foundList.name);
        res.render("list",{listTitle: foundList.name, newlistItem: foundList.items});
      }
    }
  });

});

app.post("/",function(req,res){

  const itemName=req.body.newitem;
  const listName=req.body.list;
  
  const item=new Item({
    name:itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});



app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log("error while deleting");
      } else {
        console.log("successfully deleted");
      }
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id:checkedItemId}}},
      (err,foundList)=>{
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }

});

let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}


app.listen(port,function(){
    console.log("server started succesfully!");
});