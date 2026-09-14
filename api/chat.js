const {createServer}=require('../backend.cjs');
const handler=createServer().listeners('request')[0];
module.exports=(req,res)=>handler(req,res);
