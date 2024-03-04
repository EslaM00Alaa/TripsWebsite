const isAdmin = require('../../middleware/isAdmin');

const  
     express = require('express') ,
     client = require("../../db/db"),
     validateOrder = require("../../models/order"),
     isUser = require('../../middleware/isUser'),
     router =express.Router();

     router.post("/",isUser,async(req,res)=>{
        try {
            const { error } = validateOrder(req.body);
            if (error) return res.status(404).json({ msg: error.details[0].message });
          
            let {user_id,
                name,
                trip_id,
                number_of_person,
                arrivaldate,
                departuredate,
                flight_number,
                hotel_name,
                room_name
            } =req.body ;
          
          let result = await client.query("SELECT * FROM insert_order($1,$2,$3,$4,$5,$6,$7,$8,$9);",[user_id,name,trip_id,number_of_person,arrivaldate,departuredate,flight_number,hotel_name,room_name])
            res.json(result.rows[0]);
        } catch (error) {
            return res.status(404).json({ msg: error.message });
        }
     })
      


     async function paid(u_id,id){
        try {
            await client.query("CALL paid_order($1,$2);",[u_id,id]);
        } catch (error) {
            return Error(error.message)
        }
     }



     router.put("/:id",isUser,async(req,res)=>{
        try {
            await paid(req.body.user_id,req.params.id);
            res.json({msg:"order Paid Successfully"});
        } catch (error) {
            return res.status(404).json({ msg: error.message });
        }
     })

     async function getTotal(o_id, u_id) {
        try {
            let result = await client.query("SELECT * FROM check_total ($1,$2);", [u_id, o_id]);
            let total = result.rows[0].check_total;
            return total;
        } catch (error) {
            throw error;
        }
    }
    
    
    router.post("/check/:orderId", isUser, async (req, res) => {
        try {
            let order_id = req.params.orderId;
            let user_id = req.body.user_id;
            let total = await getTotal(order_id, user_id); // Await here to get the result
            res.json({ total: total }); // Sending total as response
        } catch (error) {
            return res.status(404).json({ msg: error.message });
        }
    });
    

     router.get("/",isAdmin,async(req,res)=>{
        try {
            
            let result = await client.query("SELECT * FROM get_paid_orders();");
            res.json({data:result.rows})
        } catch (error) {
            return res.status(404).json({ msg: error.message });
        }
     })


router.delete("/:id",isAdmin,async(req,res)=>{
    try {
        let id = req.params.id;
        await client.query("CALL delete_order($1);",[id]);
        res.json({msg:"order deleted"})
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
})





















     module.exports = router;