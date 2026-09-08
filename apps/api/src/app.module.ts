import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OptionDefinitionService } from './option-definition/option-definition.service';
import { OptionDefinitionController } from './option-definition/option-definition.controller';
import { OptionDefinitionModule } from './option-definition/option-definition.module';
import { ProductTemplateModule } from './product-template/product-template.module';
import { CategoryModule } from './categories/category.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { PromotionsModule } from './promotions/promotions.module';
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
  controllers: [AppController, HealthController, OptionDefinitionController, OrdersController],
  providers: [AppService, OptionDefinitionService, OrdersService],
})
export class AppModule {}
