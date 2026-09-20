import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ProductTemplateService } from './product-template.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { CreateProductTemplateDto } from './dto/create-product-template.dto.js';
import { UpdateProductTemplateDto } from './dto/update-product-template.dto.js';

@Controller('product-templates')
export class ProductTemplateController {
    constructor(
        private readonly productTemplateService:
            ProductTemplateService,
    ) {}

    @Post()
    @Roles(UserRole.ADMIN)
    create(
        @Body()
        createProductTemplateDto:
            CreateProductTemplateDto,
    ) {
        return this.productTemplateService.create(
            createProductTemplateDto,
        );
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.productTemplateService
            .findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    findById(
        @Param('id') id: string,
    ) {
        return this.productTemplateService
            .findById(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body()
        updateProductTemplateDto:
            UpdateProductTemplateDto,
    ) {
        return this.productTemplateService.update(
            id,
            updateProductTemplateDto,
        );
    }

    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    deactivate(
        @Param('id') id: string,
    ) {
        return this.productTemplateService
            .deactivate(id);
    }

    @Patch(':id/reactivate')
    @Roles(UserRole.ADMIN)
    reactivate(
        @Param('id') id: string,
    ) {
        return this.productTemplateService
            .reactivate(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.ADMIN)
    async remove(
        @Param('id') id: string,
    ): Promise<void> {
        await this.productTemplateService
            .remove(id);
    }
}
