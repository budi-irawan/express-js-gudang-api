const express = require( 'express' );
const router = express.Router();

const roleRoute = require( './role/roleRoute' );
const userRoute = require( './user/userRoute' );

router.use( '/gudang/api/roles', roleRoute );
router.use( '/gudang/api/users', userRoute );

module.exports = router;