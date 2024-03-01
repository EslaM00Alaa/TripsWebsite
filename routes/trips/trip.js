const express = require('express');
const path = require('path');
const fs =require('fs');
const client = require("../../db/db");
const photoUpload = require("../../utils/uploadimage.js");
const { cloadinaryUploadImage, cloadinaryRemoveImage } = require("../../utils/uploadimageCdn.js");
const validateTrip = require('../../models/trip.js');

const router = express.Router();


router.post("/", async (req, res) => {
    try {
        const { error } = validateTrip(req.body);
        if (error) 
            return res.status(400).json({ msg: error.details[0].message });

        const { price, duration, vehicle, description } = req.body;
        const { insert_trip } = (await client.query("SELECT insert_trip($1, $2, $3, $4);", [price, vehicle, duration, description])).rows[0];
        res.json({ insert_trip });
    } catch (error) {
        console.error("Error creating trip:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

// Route to add inclusion to a trip
router.post("/includes", async (req, res) => {
    try {
        const { trip_id, description } = req.body;
        await client.query("CALL insert_includes ($1, $2);", [trip_id, description]);
        res.json({ msg: "Inclusion added to trip." });
    } catch (error) {
        console.error("Error adding inclusion to trip:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

// Route to add image to a trip
router.post("/image", photoUpload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "You must send an image" });
        }

        const imagePath = path.join(__dirname, `../../images/${req.file.filename}`);
        const { trip_id } = req.body;
        const uploadResult = await cloadinaryUploadImage(imagePath);
        const { public_id, secure_url } = uploadResult;

        await client.query("CALL insert_trip_image($1, $2, $3);", [public_id, trip_id, secure_url]);
        res.json({ msg: "Image added to trip." });

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Error deleting image:", err);
            }
        });
    } catch (error) {
        console.error("Error adding image to trip:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});






















module.exports=router;