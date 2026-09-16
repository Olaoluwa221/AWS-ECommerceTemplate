import { Module } from '@nestjs/common';
import { OptionDefinitionService } from './option-definition.service';
import { OptionDefinitionController } from './option-definition.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OptionDefinition,
  OptionDefinitionSchema,
} from './schema/option-definition.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: OptionDefinition.name,
                schema: OptionDefinitionSchema,
            },
        ]),
    ],
    providers: [OptionDefinitionService],
    exports: [OptionDefinitionService],
    controllers: [OptionDefinitionController]
})
export class OptionDefinitionModule {}
