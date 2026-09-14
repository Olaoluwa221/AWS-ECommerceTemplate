import { Module } from '@nestjs/common';
import { OptionDefinitionService } from './option-definition.service';
import { OptionDefinitionController } from './option-definition.controller';

@Module({
    imports: [],
    providers: [OptionDefinitionService],
    exports: [OptionDefinitionService],
    controllers: [OptionDefinitionController]
})
export class OptionDefinitionModule {}
