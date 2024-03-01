const joi = require("joi");

function validateTrip(obj)
{
    const schema = joi.object({
        price:joi.number().required(),
        duration:joi.string().trim().required(),
        vehicle:joi.string().trim().required(),
        description:joi.string().trim().required()
    })
    return schema.validate(obj)
}


module.exports=validateTrip ;
