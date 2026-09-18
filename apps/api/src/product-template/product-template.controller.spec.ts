import { Test, TestingModule } from '@nestjs/testing';
import { ProductTemplateController } from './product-template.controller.js';
import { ProductTemplateService } from './product-template.service.js';

describe('ProductTemplateController', () => {
  let controller: ProductTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTemplateController],
      providers: [ProductTemplateService],
    }).compile();

    controller = module.get<ProductTemplateController>(ProductTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
