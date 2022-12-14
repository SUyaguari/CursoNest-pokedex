import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultlimit: number;

  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>,

    private readonly configService: ConfigService
  ){
    console.log(process.env.DEFAULT_LIMIT);

    this.defaultlimit = configService.get<number>('defaultlimit')
    console.log(this.defaultlimit);
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    }catch(error){
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = this.defaultlimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no:1
      })
      .select('-__v');
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    //Por id
    if( !isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if( !pokemon){
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    //Si no encuentra nada
    if( !pokemon) 
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

      
    try{

      await pokemon.updateOne( updatePokemonDto )
      return {...pokemon.toJSON(), ...updatePokemonDto};
      
    }catch(error){
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    
    //Eliminar pokemons segun el id, nombre, o numero
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();

    //Eliminar pokemon pero sin validación
    //const result = await this.pokemonModel.findById(id);
    
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if( deletedCount ===0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    
      return ;

  }

  private handleExceptions(error:any){

    if (error.code === 11000){
      throw new BadRequestException(`Pokemon exist in bd ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }

}
