const roleModel = require( '../models' ).Role;

class Role {
	static async create( req, res ) {
		try {
			const {
				namaRole
			} = req.body;
			let errors = {};
			let response;
			let statusCode;
			if ( !namaRole || namaRole == '' || namaRole == null ) {
				errors.namaRole = 'nama role harus diisi';
			}

			if ( Object.entries( errors ).length == 0 ) {
				const role = await roleModel.create( {
					namaRole: namaRole
				} );
				statusCode = 201;
				response = role;
			} else {
				statusCode = 400;
				response = errors;
			}
			res.status( statusCode ).json( response );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async read( req, res ) {
		try {
			let response;
			let statusCode;
			const role = await roleModel.findAll();
			if ( role.length > 0 ) {
				statusCode = 200;
				response = role;
			} else {
				statusCode = 404;
				response = {
					pesan: 'belum ada data'
				}
			}
			res.status( statusCode ).json( role );
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async update( req, res ) {
		try {
			const {
				namaRole
			} = req.body;
			const {
				id
			} = req.params;
			let errors = {};
			let response;
			let statusCode;

			if ( !namaRole || namaRole == '' || namaRole == null ) {
				errors.namaRole = 'nama role harus diisi';
			}

			const role = await roleModel.update( {
				namaRole: namaRole
			}, {
				where: {
					id: id
				}
			} );

			if ( Object.entries( errors ) == 0 ) {
				statusCode = 200;
				response = {
					pesan: 'role berhasil diperbarui'
				};
				res.status( statusCode ).json( response );
			} else {
				statusCode = 400;
				response = errors;
			}
		} catch ( e ) {
			console.log( e.message );
		}
	}

	static async delete( req, res ) {
		try {
			const {
				id
			} = req.params;
			let errors = {};
			let response;
			let statusCode;

			const role = await roleModel.destroy( {
				where: {
					id: id
				}
			} );

			if ( Object.entries( errors ) == 0 ) {
				statusCode = 200;
				response = {
					pesan: 'role berhasil dihapus'
				};
				res.status( statusCode ).json( response );
			} else {
				statusCode = 400;
				response = errors;
			}
		} catch ( e ) {
			console.log( e.message );
		}
	}
}

module.exports = Role;