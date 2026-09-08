import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
    private readonly products = [
    {
      id: 1,
      name: 'Sample Product 1',
      price: 29.99,
    },
    {
      id: 2,
      name: 'Sample Product 2',
      price: 49.99,
    },
  ];

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find((product) => product.id === id);

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }
}
