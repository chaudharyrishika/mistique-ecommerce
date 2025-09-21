const express=require('express')
const app=express()
app.use(express.static("mistique/public"))
app.use(express.static("mistique/public/uploads"))
var bd=require('body-parser')
var ed=bd.urlencoded({extended:false})
var my = require('mysql')
const multer = require('multer');
const session = require('express-session');

app.use(session({
  secret: '123++', // Replace with a strong, random key
  resave: true,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  res.locals.aname = req.session.aname;
  res.locals.aemail= req.session.aemail;
  res.locals.uname= req.session.uname;
  res.locals.uemail= req.session.uemail;

  next();
});


const st = multer.diskStorage({
  destination: function (req, file, cb) { 

    cb(null, 'mistique/public/uploads/');
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: st });


var con=my.createConnection(
    {
        host:'127.0.0.1',
        user:'root',
        password:'',
        database:'ecommerce'
    });
    con.connect(function(err)
        {
         if (err)
            throw err;
         console.log("connected to mysql");
        });



app.get("/",function(req,res)
{
    var q="select * from product";
    con.query(q, function(err,result)
{
    if (err)
        throw err;
res.render("index", {data:result});
})
});
app.get("/cart",function(req,res)
{
    if(req.session.uemail==null)
        res.redirect("login")
    else{
        var em=req.session.uemail;
    
    var q="select * from cart where email='"+em+"' ";
    con.query(q, function(err,result)
{
    if (err)
        throw err;
res.render("vcart", {data:result});
})
    }
});

app.set('view engine','ejs');

app.get("/index",function(req,res)
{
res.redirect("/");  

});
app.get("/register",function(req,res)
{
res.sendFile("./mistique/public/register.html",{root:__dirname})

});
app.get("/login",function(req,res)
{
res.sendFile("./mistique/public/login.html",{root:__dirname})

});

app.get("/contact",function(req,res)
{
res.sendFile("./mistique/public/contact.html",{root:__dirname})

});
app.get("/admin",function(req,res)
{
res.sendFile("./mistique/public/admin.html",{root:__dirname})

});
app.post("/registerprocess",ed,function(req,res)
{
    var a=req.body.fl;
    var b=req.body.em;
    var c=req.body.ph;
    var d=req.body.pw;
     
    var q="insert into user values('"+a+"','"+b+"','"+c+"','"+d+"')";
    con.query(q, function(err,result)
{
   if(err)
    throw err;
res.send("Data is ineserted successfully");
})
})
app.post("/productprocess",ed,upload.single('pimg'),function(req,res)
{
    var a=req.body.pid;
    var b=req.body.pname;
    var c=req.body.pquantity;
    var d=req.body.pprice;
    var e=req.body.pdesc;
    var f=req.file.filename;
    var g=req.body.pcategory;

     
    var q="insert into product values('"+a+"','"+b+"','"+c+"','"+d+"','"+e+"','"+f+"','"+g+"')";
    con.query(q, function(err,result)
{
   if(err)
    throw err;
res.send("Data is ineserted successfully");
})
})
app.post("/loginprocess",ed,function(req,res)
{
    var a=req.body.em;
    var b=req.body.pw;
   var q="select * from user where email='"+a+"'";
   con.query(q, function(err,result)
{
    if(err)
    throw err;
var l=result.length;
if(l>0)
{
    if (result[0].Password==b){
        req.session.uemail=result[0].Email;
        req.session.uname=result[0].Name;
       
        res.redirect("/")
        }
        else
            res.sendFile("Invalid User")
}
else
    res.send("admin email is incorrect")
})
})
app.post("/contactprocess",ed,function(req,res)
{
    var a=req.body.fl;
    var b=req.body.em;
    var c=req.body.msg;
    var q="insert into contact values('"+a+"','"+b+"','"+c+"')";
con.query(q,function(err,result){
if(err)
    throw err;
res.send("Your Enquiry send Successfully");
});
});
app.post("/adminprocess",ed,function(req,res)
{
    var a=req.body.em;
    var b=req.body.pw;
   var q="select * from admin where email='"+a+"'";
   con.query(q, function(err,result)
{
    if(err)
    throw err;
var l=result.length;
if(l>0)
{
    if (result[0].Password==b){
        req.session.aemail=result[0].Email;
        req.session.aname=result[0].Name;
       res.sendFile("./mistique/public/admindashboard.html",{root:__dirname})
        }
        else
            res.sendFile("Invalid User")
}
else
    res.send("admin email is incorrect")
})
})
app.post("/changepassword",ed,function(req,res)
{
    var em=req.session.aemail
    var a=req.body.P1;
    var b=req.body.P2;
    var q="update admin set password= '"+b+"' where email='"+em+"' and Password='"+a+"'";
con.query(q,function(err,result){
if(err)
    throw err;
var r=result.affectedRows;
 if(r>0)
    res.send("password is updated")
else
    res.send("something is wrong")
});
});

app.get("/vusers",function(req,res)
{
    if(req.session.aemail==null)
        res.redirect("admin");
    else {

   
    var q="select * from user";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("vusers",{data:result});

 })
}
})
app.get("/venq",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var q="select * from contact";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("venq",{data:result});
})
    }
})
app.get("/addproducts",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var q="select * from product";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("addproduct",{data:result});
})
}
})
app.get("/vproducts",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var q="select * from product";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("vproducts",{data:result});
})
    }
})
app.get("/vcart",function(req,res)
{
     if(req.session.uemail==null)
        res.redirect("login");
    else {

    var q="select * from cart";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("vcart",{data:result});
})
    }
})
app.get("/setting",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var q="select * from admin";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("setting",{data:result});
})
    }
})
app.get("/addcart", function(req,res)
{
    if(req.session.uemail==null) {
        res.redirect("login")
    }
    else{
        var e=req.session.uemail;
        var n=req.session.uname;
        var pid=req.query.pid;
        var pn=req.query.pname;
        var pr=req.query.price;
        var im=req.query.pimg;
        var qt="select * from cart where email='"+e+"' and pid='"+pid+"' ";
     con.query(qt,function(err,result)
    {
        if(err)
            throw err;
        var L=result.length;
        if(L>0)
        {
            res.send("Product already present in cart");

        }
        else {
    var q="insert into cart values('"+n+"','"+e+"','"+pn+"','"+pid+"',"+pr+" ,'"+im+"')";
    con.query(q,function(err,result)
{
    if(err) throw err;
    res.send("Product added into cart");
})
        }
    })
    }
})


app.get("/shipping",function(req,res)
{
    res.render("shipping")

})
app.post("/shippingprocess",ed,function(req,res)
{
	if(req.session.uemail==null)
	
		res.redirect("login");
	
		
	else
	{
	var em=req.session.uemail;
	var un=req.session.uname;
	var a=req.body.address; 
	var ph=req.body.phone; 
	var city=req.body.city; 
	var pin=req.body.pincode; 
	var py=req.body.payment; 
	var qt="select pname,price from cart where email='"+em+"'";
	con.query(qt,function(err,result)
	{
var pn="";
var p=0;
for(i=0;i<result.length;i++)
{
	pn=pn+result[i].pname+" ";
	p=p+result[i].price;
}

			var q="insert into orders values('"+un+"','"+em+"','"+a+"','"+city+"','"+pin+"','"+py+"','"+pn+"','"+p+"','"+ph+"')";
			con.query(q,function(err,result)	
		{
			if(err)
				throw err;
            var qd="delete from cart where email='"+em+"'";
			con.query(qd,function(err,result)
		{
			if(err)
				throw err;
			res.send("Order successfully");
		}
		)
			
		});

});
	

}})
app.get("/vorders",function(req,res)
{
    if(req.session.aemail==null)
        res.redirect("admin");
    else {

   
    var q="select * from orders";
    con.query(q,function(err,result)
{
    if(err)
        throw err;
    res.render("vorders",{data:result});

 })
}
})
app.get("/myorders",function(req,res)
{
	if(req.session.uemail==null)
	
		res.redirect("login");
	
		
	else
	{
		var em=req.session.uemail;
		var q="select * from orders where email='"+em+"'";
		con.query(q,function(err,result)
	{
		if(err) throw err;
	   res.render("myorders",{data:result})
	})
	}
})

app.get("/newarrivals", function(req, res) {
  var q = "SELECT * FROM product ORDER BY id DESC LIMIT 5"; // Last 5 products as example
  con.query(q, function(err, result) {
    if (err) throw err;
    res.render("newarrivals", { data: result });
  });
});


app.get("/deluser",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var e=req.query.em;
    var q="delete from user where email='"+e+"'";
    con.query(q,function(err,result)
{

    res.redirect("vusers");
})
    }
})
app.get("/delenq",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var e=req.query.em;
    var q="delete from contact where email='"+e+"'";
    con.query(q,function(err,result)
{

    res.redirect("venq");
})
    }
})
app.get("/delprod",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var e=req.query.pid;
    var q="delete from product where Id='"+e+"'";
    con.query(q,function(err,result)
{

    res.redirect("vproducts");
})
    }
})
app.get("/delcart",function(req,res)
{
     if(req.session.uemail==null)
        res.redirect("login");
    else {

    var e=req.query.pid;
    var q="delete from cart where pid='"+e+"'";
    con.query(q,function(err,result)
{

    res.redirect("cart");
})
    }
})
app.get("/delorders",function(req,res)
{
     if(req.session.aemail==null)
        res.redirect("admin");
    else {

    var e=req.query.em;
    var q="delete from orders where email='"+e+"'";
    con.query(q,function(err,result)
{

    res.redirect("vorders");
})
    }
})
app.get("/delmyorder",function(req,res)
{
	if(req.session.uemail==null)
		res.redirect("login")
	else{
	var e=req.query.pc;

	var q="delete from orders where pname='"+e+"'";
	con.query(q,function(err,result)
{
	if(err)
		throw err;
	res.redirect("myorders")
})
}})
app.get("/logout",function(req,res)
{
req.session.destroy((err) => {
  res.redirect('admin'); 
})

})
app.listen(3000, ()=>{
    console.log('server is running on port 3000');
    
})