import { Module } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service.js';
import { ProductTemplateController } from './product-template.controller.js';

@Module({
  controllers: [ProductTemplateController],
  providers: [ProductTemplateService],
})
export class ProductTemplateModule {}
