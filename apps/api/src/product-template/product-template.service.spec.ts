import { Test, TestingModule } from '@nestjs/testing';
import { ProductTemplateService } from './product-template.service';

describe('ProductTemplateService', () => {
  let service: ProductTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTemplateService],
    }).compile();

    service = module.get<ProductTemplateService>(ProductTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
