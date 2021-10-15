const express = require( 'express' );
const morgan = require( 'morgan' );
const cors = require( 'cors' );

const indexRouter = require( './routes/index' );

const app = express();
const port = process.env.PORT;
app.use( morgan( ':method :url :response-time' ) );
app.use( cors() );
app.use( express.json( {
	limit: 1024 * 1024 * 20
} ) );
app.use( express.urlencoded( {
	extended: false,
	limit: '50mb'
} ) );

app.use( '/', indexRouter );
const swaggerUI = require( 'swagger-ui-express' );
const swaggerDocument = require( './swagger.json' );
app.use( '/gudang/api/dokumentasi', swaggerUI.serve, swaggerUI.setup( swaggerDocument ) );

// app.use( '/public/produk', express.static( 'public/produk' ) );

app.listen( port, () => console.log( `http://localhost:3000` ) )

module.exports = app;