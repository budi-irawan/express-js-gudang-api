const express = require( 'express' );
const router = express.Router();
const {
	upload
} = require( '../../middleware/upload' );

const userController = require( '../../controllers/user' );

router.post( '/register', upload.single( 'foto' ), userController.register );
router.put( '/verifikasi/:tokenVerifikasi', userController.verifikasi );
router.post( '/login', userController.login );
router.post( '/lupa-password', userController.lupaPassword );
router.put( '/ubah-password/:tokenReset', userController.ubahPassword );
router.get( '/', userController.getAllUser );
router.get( '/:id', userController.getById );
router.put( '/:id', userController.updateRole );
router.delete( '/:id', userController.delete );

module.exports = router;