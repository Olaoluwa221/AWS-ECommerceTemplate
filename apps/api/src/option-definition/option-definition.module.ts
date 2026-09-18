import { Module } from '@nestjs/common';
import { OptionDefinitionService } from './option-definition.service.js';
import { OptionDefinitionController } from './option-definition.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OptionDefinition,
  OptionDefinitionSchema,
} from './schema/option-definition.schema.js';

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
