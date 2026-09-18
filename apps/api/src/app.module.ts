import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthController } from './health/health.controller.js';
import { ProductsModule } from './products/products.module.js';
import { OptionDefinitionModule } from './option-definition/option-definition.module.js';
import { ProductTemplateModule } from './product-template/product-template.module.js';
import { CategoryModule } from './categories/category.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PromotionsModule } from './promotions/promotions.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ProductsModule,
    OptionDefinitionModule,
    ProductTemplateModule,
    CategoryModule,
    UsersModule,
    AuthModule,
    CartModule,
    OrdersModule,
    PromotionsModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
