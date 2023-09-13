const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();
const pokemonRoutes = require('./pokemonRoutes'); // Importa las rutas de pokemons
const typeRoutes = require('./typeRoutes'); // Importa las rutas de tipos


// Configurar los routers
router.use('/pokemons', pokemonRoutes); // Asocia las rutas de pokemons
router.use('/types', typeRoutes); // Asocia las rutas de tipos

//app
module.exports = router; 
