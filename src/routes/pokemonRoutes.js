const { Router } = require('express');
const {getPokemonNameHandler,getPokemonByIdHandler,postPokemonHandler} = require('../handlers/pokemonHandler')


const pokemonsRouter = Router();

pokemonsRouter.get('/',getPokemonNameHandler);
pokemonsRouter.get('/:id',getPokemonByIdHandler);
pokemonsRouter.post('/',postPokemonHandler);


module.exports = pokemonsRouter;