const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const fs = require( 'fs' );
const validEmail = require( '../helper/validEmail' );
const userModel = require( '../models' ).User;
const roleModel = require( '../models' ).Role;
const db = require( '../models' );
const {
	Sequelize,
	QueryTypes
} = require( 'sequelize' );

class User {
	static async register( req, res ) {
		try {
			const {
				nama,
				email,
				password,
				namaRole
			} = req.body;
			let errors = {};
			let response;
			let statusCode;
			if ( !nama ) {
				errors.nama = 'nama harus diisi';
			}
			if ( !email ) {
				errors.email = 'email harus diisi';
			} else if ( validEmail.isEmailValid( email ) == false ) {
				errors.email = 'format email tidak valid';
			} else {
				const emailExist = await userModel.findOne( {
					where: {
						email: email
					}
				} );
				if ( emailExist ) {
					errors.email = 'email sudah terdaftar';
				}
			}
			if ( !password ) {
				errors.password = "password harus diisi";
			} else if ( !/^\S*$/.test( password ) ) {
				errors.password = "password tidak boleh mengandung spasi";
			} else if ( !/^(?=.*[A-Z]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 huruf besar"
			} else if ( !/^(?=.*[a-z]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 huruf kecil"
			} else if ( !/^(?=.*[0-9]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 angka"
			} else if ( !/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 karakter spesial"
			} else if ( !/^.{6,}$/.test( password ) ) {
				errors.password = "password minimal 6 karakter"
			}
			if ( !req.file ) {
				errors.foto = 'foto belum diupload';
			}
			if ( !namaRole ) {
				errors.namaRole = 'nama role harus diisi';
			}
			const role = await roleModel.findOne( {
				where: {
					namaRole: namaRole
				}
			} );

			if ( Object.entries( errors ) == 0 ) {
				const passwordHash = await bcrypt.hash( password, 10 );
				const tokenVerifikasi = await jwt.sign( {
					email: email
				}, 'secret' );
				const user = await userModel.create( {
					nama: nama,
					email: email,
					password: passwordHash,
					foto: req.file.filename,
					idRole: role.id,
					status: false,
					kodeVerifikasi: tokenVerifikasi,
					tokenReset: null,
					tokenKadaluarsa: null
				} );
				statusCode = 201;
				response = user;
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async verifikasi( req, res ) {
		try {
			const {
				tokenVerifikasi
			} = req.params;
			let errors = {};
			let response;
			let statusCode;

			const user = await userModel.findOne( {
				where: {
					kodeVerifikasi: tokenVerifikasi
				}
			} );

			if ( !user ) {
				errors.tokenVerifikasi = 'kode verifikasi tidak valid';
			} else {
				await user.update( {
					status: true
				} );
			}
			if ( Object.entries( errors ) == 0 ) {
				statusCode = 200;
				response = {
					status: 'verifikasi berhasil'
				}
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async login( req, res ) {
		try {
			const {
				email,
				password
			} = req.body;
			let errors = {};
			let response;
			let statusCode;
			let token;

			const user = await userModel.findOne( {
				where: {
					email: email
				}
			} );

			if ( !email ) {
				errors.email = 'email harus diisi';
			} else if ( validEmail.isEmailValid( email ) == false ) {
				errors.email = 'format email tidak valid';
			} else if ( !user ) {
				errors.email = 'email belum terdaftar';
			} else if ( user.status == false ) {
				errors.email = 'anda belum verifikasi email';
			} else if ( !password ) {
				errors.password = 'password harus diisi';
			} else {
				const match = await bcrypt.compare( password, user.password );
				if ( !match ) {
					errors.password = 'password salah';
				} else {
					token = await jwt.sign( {
						id: user.id,
						email: user.email
					}, 'secret' );
				}
			}

			if ( Object.entries( errors ) == 0 ) {
				statusCode = 200;
				response = {
					token: token
				}
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async lupaPassword( req, res ) {
		try {
			const {
				email
			} = req.body;
			let errors = {};
			let response;
			let statusCode;
			if ( !email ) {
				errors.email = 'masukkan email anda';
			} else {
				const user = await userModel.findOne( {
					where: {
						email: email
					}
				} );
				if ( !user ) {
					errors.email = 'email belum terdaftar';
				} else {
					const tokenReset = await jwt.sign( {
						email: user.email
					}, 'secret' );
					await user.update( {
						tokenReset: tokenReset,
						tokenKadaluarsa: Date.now() + 3600000
					} );
				}
			}
			if ( Object.entries( errors ) == 0 ) {
				statusCode = 200;
				response = {
					pesan: 'cek email anda untuk melakukan pengaturan ulang password'
				}
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async ubahPassword( req, res ) {
		try {
			const {
				tokenReset
			} = req.params;
			const {
				password
			} = req.body;
			let errors = {};
			let response;
			let statusCode;

			const user = await userModel.findOne( {
				where: {
					tokenReset: tokenReset
				}
			} );

			if ( !password ) {
				errors.password = "password harus diisi";
			} else if ( !/^\S*$/.test( password ) ) {
				errors.password = "password tidak boleh mengandung spasi";
			} else if ( !/^(?=.*[A-Z]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 huruf besar"
			} else if ( !/^(?=.*[a-z]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 huruf kecil"
			} else if ( !/^(?=.*[0-9]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 angka"
			} else if ( !/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test( password ) ) {
				errors.password = "password harus mengandung minimal 1 karakter spesial"
			} else if ( !/^.{6,}$/.test( password ) ) {
				errors.password = "password minimal 6 karakter"
			}

			if ( Object.entries( errors ).length == 0 ) {
				const passwordHash = await bcrypt.hash( password, 10 );
				await user.update( {
					password: passwordHash,
					tokenReset: null,
					tokenKadaluarsa: null
				} );
				statusCode = 200;
				response = {
					pesan: 'password berhasil direset'
				}
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async getAllUser( req, res ) {
		try {
			let response;
			let statusCode;
			const users = await userModel.findAll( {
				include: [ {
					model: roleModel,
					as: 'role'
				} ]
			} );
			if ( users.length > 0 ) {
				statusCode = 200;
				response = users;
			} else {
				statusCode = 404;
				response = {
					pesan: 'belum ada data'
				}
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async getById( req, res ) {
		try {
			const {
				id
			} = req.params;
			let response;
			let statusCode;
			const user = await userModel.findOne( {
				where: {
					id: id
				}
			} );
			if ( !user ) {
				statusCode = 404;
				response = {
					pesan: 'data tidak ada'
				}
			} else {
				statusCode = 200;
				response = user
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async updateRole( req, res ) {
		try {
			const {
				id
			} = req.params;
			const {
				namaRole
			} = req.body;
			let errors = {};
			let response;
			let statusCode;

			if ( !namaRole ) {
				errors.nama = 'nama role harus diisi';
			}
			const role = await roleModel.findOne( {
				where: {
					namaRole: namaRole
				}
			} );

			if ( Object.entries( errors ).length == 0 ) {
				const user = await userModel.update( {
					idRole: role.id
				}, {
					where: {
						id: id
					}
				} );
				statusCode = 200;
				response = {
					pesan: 'role user berhasil diganti'
				}
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async delete( req, res ) {
		try {
			const {
				id
			} = req.params;
			let response;
			let statusCode;

			const user = await userModel.findOne( {
				where: {
					id: id
				}
			} );
			if ( !user ) {
				statusCode = 404;
				response = {
					pesan: 'user tidak ada'
				}
			} else {
				await user.destroy();
				fs.unlink( `./public/foto/${user.foto}`, ( err ) => {
					if ( err ) throw err;
				} );
				statusCode = 200;
				response = {
					pesan: 'user berhasil dihapus'
				}
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}
}

module.exports = User;