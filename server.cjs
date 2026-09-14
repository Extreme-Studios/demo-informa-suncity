const {createServer}=require('./backend.cjs');
const port=Number(process.env.PORT||4173);
createServer().listen(port,'127.0.0.1',()=>console.log('Preview: http://localhost:'+port));
