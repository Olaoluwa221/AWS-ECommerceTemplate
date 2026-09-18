import { Controller } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service.js';

@Controller('product-template')
export class ProductTemplateController {
  constructor(private readonly productTemplateService: ProductTemplateService) {}
}
