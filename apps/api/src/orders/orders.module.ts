import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [],
    exports: [OrdersService],
    providers: [OrdersService],
    controllers: [OrdersController]
})
export class OrdersModule {}
