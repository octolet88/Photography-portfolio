// app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://new-user:isKl2D40z0WYCqvc@main.zwrjcja.mongodb.net/photos?retryWrites=true&w=majority&appName=main";
const sharp = require("sharp");
const mongoose = require('mongoose');
const imageModel = require('./models/imageModel');
const fs = require('fs');



mongoose.connect(uri)
    .then(() => console.log('Connected!'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/temp');
    },
    filename: (req, file, cb) => {
        // Keep original name
        cb(null, file.originalname);

    }


});

const upload = multer({ storage });






const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

app.listen(8080);

// view engine setup
app.set('view engine', 'ejs');

app.get('/admin', (req, res) => {
    res.render('admin.ejs');
})




app.post('/admin', upload.single("image"), async (req, res) => {
    const filename = req.file.filename;
    const fileDir = path.join(__dirname, 'public', 'images','temp', filename);

    let fileNumber = req.body.position;
    const pinnedCount = await imageModel.countDocuments({ pinned: true });

    const resizedPath = path.join(__dirname, 'public', 'images', filename);


        try {

            // Resize
            await sharp(fileDir)
                .resize({
                    width: 500,
                    //height: 700,
                    fit: 'inside',
                    //background: { r: 255, g: 255, b: 255, alpha: 1 }

                })
                .toFile(resizedPath);



        // If no position provided, assign a default position
        if (fileNumber === "") {
            fileNumber = pinnedCount === 0 ? 1 : pinnedCount + 1;
        }

        fileNumber = parseInt(fileNumber, 10); // Ensure it's a number

        // Shift existing entries at or after that id up by 1
        await imageModel.updateMany(
            { id: { $gte: fileNumber } },     // All entries >= new fileNumber
            { $inc: { id: 1 } }               // Increment their ids by 1
        );

        // Save the new image at the desired id
        const newImage = new imageModel({
            id: fileNumber,
            name: filename
        });

        await newImage.save();

        console.log("Saved:", req.body);
        console.log("Assigned ID:", fileNumber);
        res.render("backtoadmin.ejs");

    } catch (err) {
        console.error("Error saving image:", err);

        // Delete the uploaded image if DB fails
        fs.unlink(fileDir, (unlinkErr) => {
            if (unlinkErr) {
                console.error("File delete failed:", unlinkErr);
                res.status(500).send("DB error, file delete failed.");
            } else {
                console.log("File deleted after DB error");
                res.status(500).send("DB error, file deleted.");
            }
        });
    }
});

app.get('/admin/delete', async (req, res) => {
    try {
        const images = await imageModel.find(); // Fetch image data from MongoDB
        res.render('delete', { images }); // <- passing 'images' to the view
    } catch (err) {
        console.error("Error fetching images:", err);
        res.status(500).send("Server error");
    }
});

app.post('/admin/delete', async (req, res) => {
    const { name } = req.body;
    console.log(req.body);
    try {
        // Delete from MongoDB
        await imageModel.deleteOne({ name });

        // Optional: delete file from filesystem
        const filePath = path.join(__dirname, 'public', 'images', name);
        fs.unlink(filePath, err => {
            if (err) console.warn("Image file not found or couldn't be deleted:", err);
        });

        res.sendStatus(200);
    } catch (err) {
        console.error("Error deleting image:", err);
        res.sendStatus(500);
    }
});





module.exports = app;
