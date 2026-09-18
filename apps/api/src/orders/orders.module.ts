import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
    imports: [],
    exports: [OrdersService],
    providers: [OrdersService],
    controllers: [OrdersController]
})
export class OrdersModule {}
