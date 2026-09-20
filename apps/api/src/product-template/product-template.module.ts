import { Module } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service.js';
import { ProductTemplateController } from './product-template.controller.js';
import { OptionDefinitionModule } from '../option-definition/option-definition.module.js';
import { ProductTemplate, ProductTemplateSchema } from './schema/product-template.schema.js';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
        MongooseModule.forFeature([
            {
                name: ProductTemplate.name,
                schema: ProductTemplateSchema,
            },
        ]),
        OptionDefinitionModule,
    ],
  controllers: [ProductTemplateController],
  providers: [ProductTemplateService],
  exports: [
        ProductTemplateService,
    ],
})
export class ProductTemplateModule {}
