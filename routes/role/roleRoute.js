const express = require( 'express' );
const router = express.Router();

const roleController = require( '../../controllers/role' );

router.post( '/', roleController.create );
router.get( '/', roleController.read );
router.put( '/:id', roleController.update );
router.delete( '/:id', roleController.delete );

module.exports = router;