import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OptionDefinitionModule } from './option-definition/option-definition.module';
import { ProductTemplateModule } from './product-template/product-template.module';
import { CategoryModule } from './categories/category.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
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
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
